const express = require('express')
require('dotenv').config()
const bcrypt = require('bcryptjs')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')
const db = require('./db/queries')
const path = require('node:path')
const { body, validationResult, matchedData } = require('express-validator')
const { isAuthenticated, isAdmin } = require('./middleware')

const app = express()
dayjs.extend(utc)
dayjs.extend(timezone)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}))
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false}))
app.use(passport.session())

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await db.getUserByUsername(username)
        if (!user) {
            return done(null, false, { message: 'User Not Found' })
        }
        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return done(null, false, { message: 'Incorrect Password' })
        }
        return done(null, user)
    } catch(err) {
        return done(err)
    }
}))
passport.serializeUser((user, done) => {
    done(null, user.id)
})
passport.deserializeUser(async (id, done) => {
    try {
        const user = await db.getUserById(id)
        done(null, user)
    } catch(err) {
        done(err)
    }
})

app.post('/send-message', isAuthenticated, async (req, res, next) => {
    try {
        const date_time = dayjs().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
        await db.addMessage(req.body.message, date_time, req.user.id)
        res.redirect('/')
    } catch(err) {
        next(err)
    }
})
app.get('/delete-message/:id', isAdmin, async (req, res, next) => {
    try {
        await db.deleteMessage(req.params.id)
        res.redirect('/')
    } catch(err) {
        next(err)
    }
})

app.get('/log-out', (req, res, next) => {
    req.logout(err => {
        if (err) {
            return next(err)
        }
        res.redirect('/')
    })
})

app.post('/sign-up',
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username cannot not be empty')
        .custom(async value => {
            const user = await db.getUserByUsername(value)
            if (user !== undefined) 
                throw new Error('User already exists. Choose a different username')
            else 
                return true
        }),
    body('password').trim().notEmpty().withMessage('Password cannot be empty'),
    body('confirmPassword').trim().custom((value, {req}) => {
        if (value === req.body.password) 
            return true
        else 
            throw new Error('Passwords do not match')
    }),
    async (req, res, next) => {
    const result = validationResult(req)
    if (result.isEmpty()) {
        try {
            const data = matchedData(req)
            const hashedPassword = await bcrypt.hash(data.password, 10)
            await db.addUser(data.username, hashedPassword)
            res.redirect('/log-in')
        } catch(err) {
            console.log(err)
            next(err)
        }
    } else {
        res.render('sign-up', { errors: result.array() })
    }
})

app.post('/log-in', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/'
}))

app.get('/sign-up', (req, res) => {
    res.render('sign-up')
})

app.get('/log-in', (req, res) => {
    res.render('log-in')
})

app.get('/give-up-role', isAuthenticated, async (req, res) => {
    await db.removeRole(req.user.username)
    res.redirect('/')
})
app.post('/get-role', isAuthenticated, async (req, res) => {
    if (req.body.role == 'Club member' && req.body.secretKey == process.env.CLUB_MEMBER_SECRET_KEY) {
        await db.addRole(req.user.username, req.body.role)
    } else if (req.body.role == 'Admin' && req.body.secretKey == process.env.ADMIN_SECRET_KEY) {
        await db.addRole(req.user.username, req.body.role)
    } else {
        res.send('Invalid secret key')
    }
    res.redirect('/')
})
app.get('/get-role', isAuthenticated, async (req, res) => {
    const roles = await db.getAllRoles()
    res.render('get-role', {roles: roles})
})

app.get('/', async (req, res) => {
    let messages
    let detailsToSend
    if (req.isAuthenticated()) {
        if (req.user.role == null) {
            detailsToSend = {
                isAuthenticated: req.isAuthenticated(),
                username: req.user.username,
                messages: await db.getAllMessagesWithoutDetails()
            }
        } else {
            messages = await db.getAllMessagesWithDetails()
            messages = messages.map(message => ({
                ...message,
                sent_at: dayjs(message.sent_at).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss')
            }))
            detailsToSend = {
                username: req.user.username,
                isAuthenticated: req.isAuthenticated(),
                messages: messages,
                role: req.user.role
            }
        }
    } else {
        detailsToSend = {
            isAuthenticated: req.isAuthenticated(),
            messages: await db.getAllMessagesWithoutDetails(),
        }
    }
    res.render('index', detailsToSend)
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!'); 
});

app.listen(process.env.PORT, () => {
    console.log('App successfully running')
})
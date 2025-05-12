const express = require('express')
require('dotenv').config()
const bcrypt = require('bcryptjs')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const db = require('./db/queries')
const path = require('node:path')

const app = express()
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

app.get('/log-out', (req, res, next) => {
    req.logout(err => {
        if (err) {
            return next(err)
        }
        res.redirect('/')
    })
})

app.post('/sign-up', async (req, res, next) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        await db.addUser(req.body.username, hashedPassword)
        res.redirect('/log-in')
    } catch(err) {
        console.log(err)
        next(err)
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

app.get('/', (req, res) => {
    res.render('index', {isAuthenticated: req.isAuthenticated(), username: req.user?.username})
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!'); 
});

app.listen(process.env.PORT, () => {
    console.log('App successfully running')
})
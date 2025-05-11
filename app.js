const express = require('express')
require('dotenv').config()
const bcrypt = require('bcryptjs')
const db = require('./db/queries')
const path = require('node:path')

const app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: true}))

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

app.post('/log-in', (req, res) => {
    res.redirect('/')
})

app.get('/sign-up', (req, res) => {
    res.render('sign-up')
})

app.get('/log-in', (req, res) => {
    res.render('log-in')
})

app.get('/', (req, res) => {
    res.render('index')
})

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!'); 
});

app.listen(process.env.PORT, () => {
    console.log('App successfully running')
})
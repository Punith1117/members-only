const express = require('express')
require('dotenv').config()
const path = require('node:path')

const app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.post('/sign-up', (req, res) => {
    res.redirect('/log-in')
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

app.listen(process.env.PORT, () => {
    console.log('App successfully running')
})
const express = require('express')
require('dotenv').config()
const path = require('node:path')

const app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index')
})

app.listen(process.env.PORT, () => {
    console.log('App successfully running')
})
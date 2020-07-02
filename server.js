const express = require('express')
const fetch = require('node-fetch')
const parser = require('body-parser')
const formParser = parser.urlencoded({ extended: false })
const pino = require('pino')
const pinoExpress = require('express-pino-logger')
const passport = require('passport')

const passportSetup = require('./passport-setup')

const router = require('express').Router();

router.get('/google', passport.authenticate('google',{
scope: ['profile']

}))






API_URL = process.env.API_URL
prova = 'http://localhost:8081' 
const app = express()
const log = pino({ level: process.env.LOG_LEVEL || 'info' })
app.use(pinoExpress({ logger: log, useLevel: 'trace' }))

app.set('view engine', 'ejs')
app.use(express.static('views'))

app.get('/', (req, res) => {
  res.render('index')
})


app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', formParser, async (req, res) => {
  try {
    const apiRes = await fetch(`${API_URL}/login`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: req.body.name,
        email: req.body.email,
        pass: req.body.pass
      })
    })
    if (apiRes.ok) res.redirect('/profile')
    else res.status(apiRes.status).send('Erroraccio')
  } catch (err) {
    throw err
  }
})



app.get('/google', passport.authenticate('google',{
scope: ['profile']


}))


app.get('/register', (req, res) => {
  res.render('register')
})

app.post('/register', formParser, async (req, res) => {
  try {
    const apiRes = await fetch(`${prova}/register`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: req.body.name,
        email: req.body.email,
        pass: req.body.pass
      })
    })
  } catch (err) {
    throw err
  }
})


app.get('/news', (req, res) => {
  
/*

  try {
    const apiRes = await fetch(`${API_URL}/news`)
    const news = await apiRes.json()
  } catch (err) {
    throw err
  }
})
*/
let newsi=   {data: '30/06/2020 15.25'  , rank:'10' ,titolo: 'Situazione Coronavirus', paese: '🇮🇹  Italia'}
 

res.render('news', { newsi: newsi})
})


app.get('/statistic',(req, res) => {
  res.render('statistic')
})

app.get('/profile' ,(req, res) => {


let usr = {info: 'TITOLO...' ,news:['provatestblabla1','provatestblabla2','provatestblabla3','provatestblabla4']}


  res.render('profile', { usr: usr})
})

function chekAuthenticated(req, res, next) {
    if (req.isAuthenticated() ) {
  return next()
  }

res.redirect('/login')
}




// Perform the required setup operations and launch the server
app.launch = function({ port = 8080 } = {}) {
  if (!API_URL) log.warn('API_URL was not given - The API is unreachable')
  app.listen(port, () => log.info(`Server listening on port ${port}`))
}

// If this is the main module, launch the web frontend
if (require.main === module) {
  log.info('Launching EcheloNews Web Frontend in standalone mode')
  app.launch({ port: process.env.PORT })
}

module.exports = app

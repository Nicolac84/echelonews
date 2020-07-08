/** echelonews - Web frontend
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
'use strict'
const express = require('express')
const cookieParser = require('cookie-parser')
const fetch = require('node-fetch')
const Parser = require('body-parser')
const pino = require('pino')
const pinoExpress = require('express-pino-logger')
const OAuth = require('./oauth')

// Environment variables
const API_URL = process.env.API_URL
const OAUTH_BRIDGE_URL = process.env.OAUTH_BRIDGE_URL
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

const formDecoder = Parser.urlencoded({ extended: false })
const log = pino({ level: process.env.LOG_LEVEL || 'info' })

// Express application
const app = express()
app.set('view engine', 'ejs')
app.use(express.static('assets'))
app.use(cookieParser())
app.use(pinoExpress({ logger: log, useLevel: 'trace' }))

// Homepage
app.get('/', (req, res) => {
  req.log.info('Requested homepage')
  res.render('index')
})

// Login page
app.get('/login', (req, res) => {
  req.log.info('Requested login page')
  res.render('login')
})

// Login request
app.post('/login', async (req, res) => {
  req.log.info('Login request')
  try {
    const apiRes = await fetch(`${API_URL}/login`, {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.query)
    })
    const body = await apiRes.json()
    req.log.debug(`Received response from API with status code ${apiRes.status}\n%o`, body)
    switch (apiRes.status) {
      case 200:
        res.cookie('jwt', `Bearer ${body.token}`, { maxAge: 3600000 })
        return res.redirect('/') // TODO: Redirect to profile
      case 400:
        return res.status(400).redirect('/login') // TODO: Flash
      case 401:
        return res.status(400).redirect('/login') // TODO: Flash (with some other message)
      default:
        return res.status(500).send('Internal server error. Sorry')
    }
  } catch (err) {
    req.log.error(err)
    return res.status(500).send('Internal server error. Sorry')
  }
})

// Signup page
app.get('/register', (req, res) => {
  req.log.info('Requested registration page')
  res.render('register')
})

// OAuth login
app.get('/oauth', OAuth.directPath)

// OAuth login callback
app.get('/oauth/callback', OAuth.callbackPath)

// Show user profile
app.get('/profile', (req, res) => {
  req.log.info('Requested profile page')
  res.status(503).send('Not Implemented')
})

// Update user profile
app.put('/profile', formDecoder, (req, res) => {
  req.log.info('Attempting to update profile')
  res.status(503).send('Not Implemented')
})

// Multiplexed news, according to user settings
app.get('/news', (req, res) => {
  req.log.info('Requested news page')
  res.status(503).send('Not Implemented')
})

// Multiplexed news, according to a custom multiplex request
app.post('/news', formDecoder, (req, res) => {
  req.log.info('Attempting to fetch news with custom multiplexer parameters')
  res.status(503).send('Not Implemented')
})

// Authentication middleware
// Turns the 'jwt' cookie into a Json Web Token, or redirects if the cookie is not present
function tokenMiddleware(req, res, next) {
  if (!req.cookies || !req.cookies.jwt) {
    req.log.warn('Attempted to access protected route without a jwt cookie')
    return res.redirect('/login')
  }
  console.log(req.cookies.jwt)
  req.jwt = req.cookies.jwt
  next()
}

// Perform the required setup operations and launch the server
app.launch = function({ port = 8080 } = {}) {
  if (!API_URL) log.warn('API_URL was not given - The API is unreachable')
  if (!OAUTH_BRIDGE_URL) log.warn('OAUTH_BRIDGE_URL was not given - OAuth cannot be used')
  OAuth.setup({
    oauthBridge: OAUTH_BRIDGE_URL,
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    log,
  })
  app.listen(port, () => log.info(`Server listening on port ${port}`))
}

// If this is the main module, launch the web frontend
if (require.main === module) {
  log.debug('Launching EcheloNews Web Frontend in standalone mode')
  app.launch({ port: process.env.PORT })
}

module.exports = app
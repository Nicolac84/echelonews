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
  res.render('index', {
    title: 'Homepage'
  })
})

// Login page
app.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login'
  })
})

// OAuth login
app.get('/oauth', OAuth.directPath)

// OAuth login callback
app.get('/oauth/callback', OAuth.callbackPath)

// Signup page
app.get('/register', (req, res) => {
  res.status(503).send('Not Implemented')
})

// Multiplexed news, according to user settings
app.get('/news', (req, res) => {
  res.status(503).send('Not Implemented')
})

// Multiplexed news, according to a custom multiplex request
app.post('/news', formDecoder, (req, res) => {
  res.status(503).send('Not Implemented')
})

// Show user profile
app.get('/profile', (req, res) => {
  res.status(503).send('Not Implemented')
})

// Update user profile
app.put('/profile', formDecoder, (req, res) => {
  res.status(503).send('Not Implemented')
})


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
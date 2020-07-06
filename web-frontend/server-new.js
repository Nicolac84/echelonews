/** echelonews - Web frontend
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
'use strict'
const express = require('express')
const fetch = require('node-fetch')
const Parser = require('body-parser')
const pino = require('pino')
const pinoExpress = require('express-pino-logger')

const API_URL = process.env.API_URL

const formDecoder = Parser.urlencoded({ extended: false })
const log = pino({ level: process.env.LOG_LEVEL || 'info' })

const app = express()
app.use(pinoExpress({ logger: log, useLevel: 'trace' }))
app.set('view engine', 'ejs')
app.use(express.static('assets'))


// Homepage
app.get('/', (req, res) => {
  res.render('index')
})

// Login page
app.get('/login', (req, res) => {
  res.status(503).send('Not Implemented')
})

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
  app.listen(port, () => log.info(`Server listening on port ${port}`))
}

// If this is the main module, launch the web frontend
if (require.main === module) {
  log.debug('Launching EcheloNews Web Frontend in standalone mode')
  app.launch({ port: process.env.PORT })
}

module.exports = app

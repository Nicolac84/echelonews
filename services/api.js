/** echelonews - Main exposed API
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
'use strict'
const express = require('express')
const jsonParser = require('body-parser').json()
//const fetch = require('node-fetch')
const pino = require('pino')
const pinoExpress = require('express-pino-logger')
const Auth = require('../lib/authstar')

const log = pino({ level: process.env.LOG_LEVEL || 'info' })
const app = express()
app.use(pinoExpress({ logger: log, useLevel: 'trace' }))

app.get('/', (req, res) => {
  res.status(503).json({ message: 'Not Implemented' })
})

app.post('/login', jsonParser, Auth.middlewares.login)

app.get('/countries', (req, res) => {
  res.status(503).json({ message: 'Not Implemented' })
})

app.post('/countries', jsonParser, (req, res) => {
  res.status(503).json({ message: 'Not Implemented' })
})

app.get('/feedback', (req, res) => {
  res.status(503).json({ message: 'Not Implemented' })
})

app.put('/feedback', jsonParser, (req, res) => {
  res.status(503).json({ message: 'Not Implemented' })
})

app.delete('/feedback', (req, res) => {
  res.status(503).json({ message: 'Not Implemented' })
})

app.get('/news', (req, res) => {
  res.status(503).json({ message: 'Not Implemented' })
})

app.post('/news', jsonParser, (req, res) => {
  res.status(503).json({ message: 'Not Implemented' })
})

// Perform the application setup, programmatically
app.setup = function({ logger, userHandlerUrl, jwtSecret } = {}) {
  Auth.setup({
    log: logger || log,
    jwtSecret: jwtSecret || process.env.JWT_SECRET,
    userHandlerUrl: userHandlerUrl || process.env.USER_HANDLER_URL,
  })
}

// Perform the required setup operations and launch the server
app.launch = function({ port = 8080, userHandlerUrl, jwtSecret} = {}) {
  app.setup({ userHandlerUrl, jwtSecret })
  app.listen(port, () => log.info(`Server listening on port ${port}`))
}

// If this is the main module, launch the API server
if (require.main === module) {
  log.info('Launching EcheloNews RESTful API in standalone mode')
  app.launch({ port: process.env.PORT })
}

module.exports = app

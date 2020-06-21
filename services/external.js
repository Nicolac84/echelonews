/** echelonews - Main exposed API
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
'use strict'
const express = require('express')
const jsonParser = require('body-parser').json()
const pino = require('pino')
const pinoExpress = require('express-pino-logger')

const log = pino({ level: process.env.LOG_LEVEL || 'info' })
const app = express()
app.use(pinoExpress({ logger: log, useLevel: 'trace' }))


app.get('/', (req, res) => {
  res.status(503).json({ message: 'Not Implemented' })
})

app.get('/login', (req, res) => {
  res.status(503).json({ message: 'Not Implemented' })
})

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

// If this is the main module, launch the API server
if (require.main === module) {
  log.info('Launching EcheloNews RESTful API in standalone mode')
  const port = process.env.PORT || 8080
  app.listen(port, () => log.info(`Server listening on port ${port}`))
}

module.exports = app

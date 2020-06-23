/** echelonews - Main exposed API
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
'use strict'
const express = require('express')
const jsonParser = require('body-parser').json()
const fetch = require('node-fetch')
const pino = require('pino')
const pinoExpress = require('express-pino-logger')
const Jwt = require('jsonwebtoken')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
//const auth = require('../lib/passport-conf')

const userHandlerUrl = process.env.USER_HANDLER_URL
const jwtSecret = process.env.JWT_SECRET

const log = pino({ level: process.env.LOG_LEVEL || 'info' })
const app = express()
app.use(pinoExpress({ logger: log, useLevel: 'trace' }))

passport.use(new LocalStrategy({
    usernameField: 'name',
    passwordField: 'pass',
  }, async (name, pass, done) => {
    log.trace('Starting passport login strategy callback')
    try {
      const res = await fetch(userHandlerUrl + '/auth', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pass }),
      })
      const status = res.status, body = await res.json()
      switch (status) {
        case 200:
          log.info(`Login attempt successful for user ${body.id} (${body.name})`)
          done(null, body)
          break
        case 400:
        case 404:
          log.warn(`Login attempt failed (user handler returned ${status})\n%o`, body)
          done(null, false, { status, errors: body })
          break
        default:
          done(body)
          break
      }
    } catch (err) {
      log.error(err)
      done(err)
    }
  })
)

function jwtMidware(req, res, next) {
  const token = req.header('Authorization') // TODO: Remove 'Bearer '
  try {
    const payload = Jwt.verify(token, jwtSecret)
    req.user = payload.user
    next()
  } catch (err) {
    log.warn(`Invalid bearer token ${token}`)
    res.status(401).json({ message: 'Invalid bearer token' })
  }
}

app.get('/', (req, res) => {
  res.status(503).json({ message: 'Not Implemented' })
})

app.post('/login', jsonParser, passport.authenticate('local'), (req, res) => {
  log.info(`Giving new JWT to user ${req.user.id} (${req.user.name})`)
  const token = Jwt.sign({ user: req.user }, jwtSecret)
  res.status(200).json({ token })
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

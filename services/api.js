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
const Auth = require('../lib/authstar')
const { User } = require('../models/user')

const log = pino({ level: process.env.LOG_LEVEL || 'info' })
const app = express()
app.use(pinoExpress({ logger: log, useLevel: 'trace' }))

app.get('/', (req, res) => {
  res.status(503).json({ message: 'Not Implemented' })
})

app.post('/login', jsonParser, Auth.middlewares.login)

app.get('/profile', Auth.middlewares.jwt, async (req, res) => {
  try {
    const user = await fetchUser(req.user.id)
    res.status(200).json(user)
  } catch (err) {
    log.error(err)
    res.status(500).json({ message: 'Internal server error. Sorry' })
  }
})

app.get('/countries', Auth.middlewares.jwt, async (req, res) => {
  try {
    const user = await fetchUser(req.user.id)
    res.status(200).json(user.countries)
  } catch (err) {
    log.error(err)
    res.status(500).json({ message: 'Internal server error. Sorry' })
  }
})

app.post('/countries', jsonParser, Auth.middlewares.jwt, async (req, res) => {
  try {
    const countries = req.body
    const errors = User.validate('countries', countries)
    if (errors) {
      log.warn(`Malformed countries update attempt by user ${req.user.id}\n%o`, countries)
      return res.status(400).json({ errors })
    }
    await updateUser(req.user.id, req.body)
    res.sendStatus(200)
  } catch (err) {
    log.error(err)
    res.status(500).json({ message: 'Internal server error. Sorry' })
  }
})

app.get('/topics', Auth.middlewares.jwt, async (req, res) => {
  try {
    const user = await fetchUser(req.user.id)
    res.status(200).json(user.topics)
  } catch (err) {
    log.error(err)
    res.status(500).json({ message: 'Internal server error. Sorry' })
  }
})

app.post('/topics', jsonParser, Auth.middlewares.jwt, async (req, res) => {
  try {
    const topics = req.body
    const errors = User.validate('topics', topics)
    if (errors) {
      log.warn(`Malformed topics update attempt by user ${req.user.id}\n%o`, topics)
      return res.status(400).json({ errors })
    }
    await updateUser(req.user.id, req.body)
    res.sendStatus(200)
  } catch (err) {
    log.error(err)
    res.status(500).json({ message: 'Internal server error. Sorry' })
  }
})

app.get('/feedback', Auth.middlewares.jwt, (req, res) => {
  res.status(503).json({ message: 'Not Implemented' })
})

app.put('/feedback', jsonParser, Auth.middlewares.jwt, (req, res) => {
  res.status(503).json({ message: 'Not Implemented' })
})

app.delete('/feedback', Auth.middlewares.jwt, (req, res) => {
  res.status(503).json({ message: 'Not Implemented' })
})

app.get('/news', Auth.middlewares.jwt, (req, res) => {
  res.status(503).json({ message: 'Not Implemented' })
})

app.post('/news', jsonParser, Auth.middlewares.jwt, (req, res) => {
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

async function fetchUser(id) {
  try {
    if (!Number.isInteger(id))
      return new TypeError('User ID is not an integer')
    const res = await fetch(Auth.userHandlerUrl + `/users/byid/${id}`)
    if (!res.ok)
      return new Error(`User handler returned status ${res.status}`)
    return await res.json()
  } catch (err) {
    throw err
  }
}

async function updateUser(id, body) {
  try {
    if (!Number.isInteger(id))
      return new TypeError('User ID is not an integer')
    const res = await fetch(Auth.userHandlerUrl + `/users/byid/${id}`, {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok)
      return new Error(`User handler returned status ${res.status}`)
  } catch (err) {
    throw err
  }
}

module.exports = app

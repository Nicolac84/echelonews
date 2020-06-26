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
const Validable = require('validable')
const Auth = require('../lib/authstar')
const { User } = require('../models/user')
const { Feedback } = require('../models/feedback')

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

app.post('/countries', Auth.middlewares.jwt, jsonParser, async (req, res) => {
  try {
    const countries = req.body
    const errors = User.validate('countries', countries)
    if (errors) {
      log.warn(`Malformed countries update attempt by user ${req.user.id}\n%o`, countries)
      return res.status(400).json({ errors })
    }
    await updateUser(req.user.id, { countries })
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

app.post('/topics', Auth.middlewares.jwt, jsonParser, async (req, res) => {
  try {
    const topics = req.body
    const errors = User.validate('topics', topics)
    if (errors) {
      log.warn(`Malformed topics update attempt by user ${req.user.id}\n%o`, topics)
      return res.status(400).json({ errors })
    }
    await updateUser(req.user.id, { topics })
    res.sendStatus(200)
  } catch (err) {
    log.error(err)
    res.status(500).json({ message: 'Internal server error. Sorry' })
  }
})

app.get('/feedback', Auth.middlewares.jwt, async (req, res) => {
  try {
    const fbs = await Feedback.fetchMany({ account: req.user.id })
    res.status(200).json(fbs.map(f => ({
      npaper: f.npaper,
      score: f.score
    })))
  } catch (err) {
    log.error(err)
    res.status(500).json({ message: 'Internal server error. Sorry' })
  }
})

app.put('/feedback', Auth.middlewares.jwt, jsonParser, async (req, res) => {
  try {
    const errors = Validable.merge(
      Validable.requirelist(req.body, ['npaper', 'score']),
      Validable.whitelist(req.body, ['npaper', 'score']),
      Feedback.validateObject(req.body, true)
    )
    if (errors) {
      log.warn(`User ${req.user.id} performed bad feedback update request\n%o`, req.body)
      return res.status(400).json({ errors })
    }

    const fb = await Feedback.retrieve(req.user.id, req.body.npaper)
    fb.score += req.body.score
    if (fb.exists) await fb.update('score')
    else await fb.save()
    res.sendStatus(200)
  } catch (err) {
    log.error(err)
    res.status(500).json({ message: 'Internal server error. Sorry' })
  }
})

app.delete('/feedback', Auth.middlewares.jwt, async (req, res) => {
  try {
    await Feedback.deleteMany({ account: req.user.id })
    res.sendStatus(200)
  } catch (err) {
    log.error(err)
    res.status(500).json({ message: 'Internal server error. Sorry' })
  }
})

app.get('/news', Auth.middlewares.jwt, (req, res) => {
})

app.post('/news', Auth.middlewares.jwt, jsonParser, (req, res) => {
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
  Feedback.db.setup(process.env.POSTGRES_URI)
  app.setup({ userHandlerUrl, jwtSecret })
  app.listen(port, () => log.info(`Server listening on port ${port}`))
}

// If this is the main module, launch the API server
if (require.main === module) {
  log.info('Launching EcheloNews RESTful API in standalone mode')
  app.launch({ port: process.env.PORT })
}

// Fetch a user calling the user handler
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

// Update a user calling the user handler
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

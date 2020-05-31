/** echelonews - User handler module
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
const express = require('express')
const json_parser = require('body-parser').json()
const { User } = require('../models/user')
const app = express()

// Get metadata for the current user handler server instance
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'EcheloNews User Handler server',
    uptime: process.uptime(),
  })
})

// Access users by arbitrary identifier
for (const id of ['id', 'name', 'email']) {
  // Fetch a user by arbitrary field
  app.get(`/users/by${id}/:${id}`, async (req, res) => {
    const idval = decodeURIComponent(req.params[id])
    if (!idval || User.validate(id, idval)) {
      res.status(400).json({ message: `Invalid ${id} ${idval}` })
    }
    try {
      const user = await User.fetch(id, idval)
      if (!user) res.status(404).send()
      else res.status(200).json(user)
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Internal database error. Sorry' })
    }
  })

  // Update a user by arbitrary field
  // TODO: Avoid performing 2 queries
  app.put(`/users/by${id}/:${id}`, json_parser, async (req, res) => {
    const idval = decodeURIComponent(req.params[id])
    if (!idval || User.validate(id, idval)) {
      res.status(400).json({ message: `Invalid ${id} ${idval}` })
    }

    let errors
    const fields = Object.getOwnPropertyNames(req.body)

    // Check against inexistent fields
    errors = fields
      .filter(f => !User.db.columns.has(f))
      .map(f => [f, [`Field ${f} does not exist`]])
    if (errors.length) {
      res.status(400).json(Object.fromEntries(errors))
      return
    }

    // Check against non-updateable fields
    errors = fields
      .filter(f => UPDATE_FORBIDDEN.has(f))
      .map(f => [f, [`${f} can not be updated`]])
    if (errors.length) {
      res.status(403).json(Object.fromEntries(errors))
      return
    }

    // Check against malformed values
    errors = fields.map(f => User.validate(f, req.body[f])).filter(e => e)
    if (errors.length) {
      res.status(400).json(Object.fromEntries(errors))
      return
    }

    // Attempt to update the user
    try {
      const user = await User.fetch(id, idval)
      if (!user) res.status(404).send()
      else {
        Object.assign(user, req.body)
        await user.update()
        res.status(200).send() // TODO: Handle duplicate key error
      }
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Internal database error. Sorry' })
    }
  })

  // Delete a user by arbitrary field
  app.delete(`/users/by${id}/:${id}`, async (req, res) => {
    const idval = decodeURIComponent(req.params[id])
    if (!idval || User.validate(id, idval)) {
      res.status(400).json({ message: `Invalid ${id} ${idval}` })
    }
    try {
      const deleted = await User.delete(id, idval)
      res.status(deleted ? 200 : 404).send()
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Internal database error. Sorry' })
    }
  })
}

// Authenticate with login/password credentials
app.post('/auth', json_parser, (req, res) => {
  res.status(503).send()
})

// Fields which can not be updated
const UPDATE_FORBIDDEN = new Set(['id', 'hash', 'created'])

module.exports = app

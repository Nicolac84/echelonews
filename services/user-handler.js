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
    if (!idval || User.validate(id, idval))
      res.status(400).json({ message: `Invalid ${id} ${idval}` })
    try {
      const user = await User.fetch(id, idval)
      if (!user) res.status(404).json({ message: 'User not found' })
      else res.status(200).json(user)
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Internal database error. Sorry' })
    }
  })

  // Update a user by arbitrary field
  app.put(`/users/by${id}/:${id}`, json_parser, (req, res) => {
    res.status(503).send()
  })

  // Delete a user by arbitrary field
  app.delete(`/users/by${id}/:${id}`, (req, res) => {
    res.status(503).send()
  })
}

// Authenticate with login/password credentials
app.post('/auth', json_parser, (req, res) => {
  res.status(503).send()
})

module.exports = app

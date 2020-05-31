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

// Get a user by ID
app.get('/users/byid/:id', async (req, res) => {
  if (User.validate('id', req.params.id))
    res.status(400).json({ message: 'Invalid ID' })
  try {
    const user = await User.fetch('id', req.params.id)
    if (!user) res.status(404).json({ message: 'Not Found' })
    else res.status(200).json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal database error. Sorry' })
  }
})

// Get a user by username
app.get('/users/byname/:name', async (req, res) => {
  if (User.validate('name', req.params.name))
    res.status(400).json({ message: 'Invalid ID' })
  try {
    const user = await User.fetch('name', req.params.name)
    if (!user) res.status(404).json({ message: 'Not Found' })
    else res.status(200).json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal database error. Sorry' })
  }
})

// Get a user by email
app.get('/users/byemail/:email', async (req, res) => {
  if (User.validate('email', req.params.email))
    res.status(400).json({ message: 'Invalid ID' })
  try {
    const user = await User.fetch('email', req.params.email)
    if (!user) res.status(404).json({ message: 'Not Found' })
    else res.status(200).json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal database error. Sorry' })
  }
})

// Update a user by ID
app.put('/users/byid/:id', json_parser, (req, res) => {
  res.status(503).send()
})

// Update a user by username
app.put('/users/byname/:name', json_parser, (req, res) => {
  res.status(503).send()
})

// Update a user by email
app.put('/users/byemail/:email', json_parser, (req, res) => {
  res.status(503).send()
})

// Delete a user by ID
app.delete('/users/byid/:id', (req, res) => {
  res.status(503).send()
})

// Delete a user by username
app.delete('/users/byname/:name', (req, res) => {
  res.status(503).send()
})

// Delete a user by email
app.delete('/users/byemail/:email', (req, res) => {
  res.status(503).send()
})

// Authenticate with login/password credentials
app.post('/auth', json_parser, (req, res) => {
  res.status(503).send()
})

module.exports = app

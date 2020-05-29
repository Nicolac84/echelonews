/** echelonews
 * User handler module
 * @author jcondor
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
const express = require('express')
const json_parser = require('bosy-parser').json()
const app = express()


// Get metadata for the current user handler server instance
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hi there!' })
})


// Get a user by ID
app.get('/users/byid/:id', (req, res) => {
})

// Get a user by username
app.get('/users/byname/:name', (req, res) => {
})

// Get a user by email
app.get('/users/byemail/:email', (req, res) => {
})


// Update a user by ID
app.put('/users/byid/:id', json_parser, (req, res) => {
})

// Update a user by username
app.put('/users/byname/:name', json_parser, (req, res) => {
})

// Update a user by email
app.put('/users/byemail/:email', json_parser, (req, res) => {
})


// Delete a user by ID
app.delete('/users/byid/:id', (req, res) => {
})

// Delete a user by username
app.delete('/users/byname/:name', (req, res) => {
})

// Delete a user by email
app.delete('/users/byemail/:email', (req, res) => {
})


// Authenticate with login/password credentials
app.post('/auth', json_parser, (req, res) => {
})

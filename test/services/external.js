// echelonews - Test Unit
// Main exposed API
'use strict'
require('dotenv').config({ path: '.env.test' })
const chai = require('chai')
const expect = chai.expect
const app = require('../../services/external.js')
chai.use(require('chai-http'))

describe('Exposed API', function() {
  describe('GET /', () => {
  })

  describe('GET /login', () => {
    it('should be successful with good credentials')
    it('should return 400 with invalid credential properties')
    it('should return 404 with inexistent username')
    it('should return 404 with incorrect password')
  })

  describe('GET /countries', () => {
    it('should give an array of countries')
  })

  describe('POST /countries', () => {
    it('should save the given of countries if they are consistent')
  })

  describe('GET /feedback', () => {
    it('should return all the feedbacks registered by a user')
  })

  describe('PUT /feedback', () => {
    it('should create a new feedback if none is related to the newspaper')
    it('should update a feedback if one related to the newspaper already exists')
  })

  describe('DELETE /feedback', () => {
    it('should delete all the feedbacks related to the user')
  })

  describe.skip('GET /news', () => {
  })

  describe.skip('POST /news', () => {
  })

  describe('when bearer JWT is missing', function() {
    [ ['GET',  '/news'],
      ['GET',  '/feedback'],
      ['GET',  '/countries'],
      ['PUT',  '/feedback'],
      ['POST', '/news'],
      ['POST', '/feedback'],
      ['POST', '/countries'],
      ['DELETE', '/feedback'],
    ].forEach(([method, path]) => {
      specify(`${method} ${path} should return 401`)
    })
  })
})

/** echelonews
 * User handler module test unit
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
const chai = require('chai')
const expect = chai.expect
chai.use(require('chai-http'))

describe('User Handler API', function() {
  describe('/ (index)', function() {
    specify('GET should return general information on the server')
  })

  describe('/users', function() {
    describe('/byid/{id}', function() {
      describe('GET', function() {
        it('should be successful with good id')
        it('should return 404 with inexistent id')
      })
      describe('PUT', function() {
        it('should be successful with good id and consistent parameters')
        it('should return 404 with inexistent id')
      })
      describe('DELETE', function() {
        it('should be successful with good id')
        it('should return 404 with inexistent id')
      })
    })
    
    describe('/byname/{name}', function() {
      describe('GET', function() {
        it('should be successful with good name')
        it('should return 404 on inexistent name')
      })
      describe('PUT', function() {
        it('should be successful with good name and consistent parameters')
        it('should return 404 on inexistent name')
      })
      describe('DELETE', function() {
        it('should be successful with good name')
        it('should return 404 on inexistent name')
      })
    })

    describe('/byemail/{email}', function() {
      describe('GET', function() {
        it('should be successful with good email')
        it('should return 404 on inexistent email')
      })
      describe('PUT', function() {
        it('should be successful with good email and consistent parameters')
        it('should return 404 on inexistent email')
      })
      describe('DELETE', function() {
        it('should be successful with good email')
        it('should return 404 on inexistent email')
      })
    })
  })

  describe('/auth', function() {
    it('should be successful with good parameters')
    it('should return 404 on inexistent user')
    it('should return 401 on bad password')
  })
})

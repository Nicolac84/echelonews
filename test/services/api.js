// echelonews - Test Unit
// Main exposed API
'use strict'
require('dotenv').config({ path: '.env.test' })
const chai = require('chai')
const expect = chai.expect
const { UserFactory } = require('../factories/user')
const app = require('../../services/api.js')
const userHandlerApp = require('../../services/user-handler')
chai.use(require('chai-http'))

let user, absentUser
before(async () => {
  // Setup the database
  try {
    [user,absentUser] = await UserFactory.setupTestDB(process.env.POSTGRES_URI)
  } catch (err) {
    throw err
  }
  UserFactory.cleanupTestDB() // The user handler will take care of the pool
  // Launch the user handler server
  userHandlerApp.launch({
    postgresUri: process.env.POSTGRES_URI,
    port: 8081 // TODO: Handle this better
  })
  // Perform the API setup
  app.setup({
    userHandlerUrl: 'http://localhost:8081',
    jwtSecret: 'none',
  })
})
after(async () => {
  UserFactory.cleanupTestDB()
})

describe('Exposed API', function() {
  // Open a persistent connection before testing
  let conn
  before(() => (conn = chai.request(app).keepOpen()))
  after(() => conn.close())

  describe('GET /', () => {
  })

  describe('POST /login', () => {
    it('should be successful with good credentials', async () => {
      try {
        const res = await conn.post('/login').send({
          name: user.name,
          pass: user.pass
        })
        expect(res).to.have.status(200)
        expect(res.body).to.have.ownProperty('token')
        expect(res.body.token).to.be.a('string')
      } catch (err) {
        throw err
      }
    })

    it('should return 400 with invalid credential properties', async () => {
      try {
        const res = await conn.post('/login').send({
          name: user.name,
          pass: user.pass,
          nonExistentField: 'ciaone'
        })
        expect(res).to.have.status(400)
      } catch (err) {
        throw err
      }
    })

    it('should return 401 with inexistent username', async () => {
      try {
        const res = await conn.post('/login').send({
          name: absentUser.name,
          pass: absentUser.pass
        })
        expect(res).to.have.status(401)
      } catch (err) {
        throw err
      }
    })

    it('should return 401 with incorrect password', async () => {
      try {
        const res = await conn.post('/login').send({
          name: user.name,
          pass: user.pass + 'abc'
        })
        expect(res).to.have.status(401)
      } catch (err) {
        throw err
      }
    })
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

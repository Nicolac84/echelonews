// echelonews - Test Unit
// User handler API
const chai = require('chai')
const expect = chai.expect
const app = require('../services/user-handler')
const { User } = require('../models/user')
const { UserFactory } = require('./factories/user')
chai.use(require('chai-http'))

describe('User Handler API', function () {
  // Initialize test database with mock users
  let presentUser, absentUser
  before(async () => {
    try {
      [presentUser, absentUser] = await UserFactory.setupTestDB(
        process.env.POSTGRES_URI
      )
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  })
  after(() => UserFactory.cleanupTestDB())

  // Open a persistent connection before testing
  let conn
  before(() => (conn = chai.request(app).keepOpen()))
  after(() => conn.close())

  specify('GET / should return general information on the server', async () => {
    const res = await conn.get('/')
    expect(res).to.have.status(200)
    expect(res.body).to.have.ownProperty('message')
    expect(res.body).to.have.ownProperty('uptime')
  })

  describe('/users', function () {
    for (const id of ['id', 'name', 'email']) {
      describe(`/by${id}/{${id}}`, function() {
        describe('GET', function() {
          it(`should be successful with good ${id}`, async () => {
            const res = await conn.get(`/users/by${id}/${encodeURIComponent(presentUser[id])}`)
            expect(res).to.have.status(200)
            expect(User.validateObject(res.body)).to.equal(undefined)
          })

          it(`should return 404 with inexistent ${id}`, async () => {
            const res = await conn.get(`/users/by${id}/${encodeURIComponent(absentUser[id])}`)
            expect(res).to.have.status(404)
          })
        })

      describe('PUT', function () {
        it(`should be successful with good ${id} and consistent parameters`)
        it(`should return 404 with inexistent ${id}`)
      })
      describe(`DELETE`, function () {
        it(`should be successful with good ${id}`)
        it(`should return 404 with inexistent ${id}`)
      })
      })
    }
  })

  describe('/auth', function () {
    it('should be successful with good parameters')
    it('should return 404 on inexistent user')
    it('should return 401 on bad password')
  })
})

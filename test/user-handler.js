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
      ;[presentUser, absentUser] = await UserFactory.setupTestDB(
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
    try {
      const res = await conn.get('/')
      expect(res).to.have.status(200)
      expect(res.body).to.have.ownProperty('message')
      expect(res.body).to.have.ownProperty('uptime')
    } catch (err) {
      throw err
    }
  })

  describe('/users', function () {
    for (const id of ['id', 'name', 'email']) {
      describe(`/by${id}/{${id}}`, function () {
        describe('GET', function () {
          it(`should be successful with good ${id}`, async () => {
            try {
              const res = await conn.get(
                `/users/by${id}/${encodeURIComponent(presentUser[id])}`
              )
              expect(res).to.have.status(200)
              expect(User.validateObject(res.body)).to.equal(undefined)
            } catch (err) {
              throw err
            }
          })

          it(`should return 404 with inexistent ${id}`, async () => {
            try {
              const res = await conn.get(
                `/users/by${id}/${encodeURIComponent(absentUser[id])}`
              )
              expect(res).to.have.status(404)
            } catch (err) {
              throw err
            }
          })
        })

        describe('PUT', function () {
          it(`should be successful with good ${id} and consistent parameters`)
          it(`should return 404 with inexistent ${id}`)
        })

        describe(`DELETE`, function () {
          it(`should be successful with good ${id}`, async () => {
            try {
              // Use another user instead of 'presentUser'
              const user = await UserFactory.create()
              await user.save()
              const res = await conn.delete(
                `/users/by${id}/${encodeURIComponent(user[id])}`
              )
              expect(res).to.have.status(200)
              expect(await User.fetch('id', user.id)).to.equal(null)
            } catch (err) {
              throw err
            }
          })

          it(`should return 404 with inexistent ${id}`, async () => {
            const res = await conn.delete(
              `/users/by${id}/${encodeURIComponent(absentUser[id])}`
            )
            expect(res).to.have.status(404)
          })
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

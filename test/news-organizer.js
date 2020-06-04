// echelonews - Test Unit
// News organizer API
'use strict'
require('dotenv').config({ path: './.env.test' })
const chai = require('chai')
const expect = chai.expect
const app = require('../services/news-organizer')
const { Article } = require('../models/article')
const { ArticleFactory } = require('./factories/article')
const { NewspaperFactory } = require('./factories/newspaper')
chai.use(require('chai-http'))

// Setup database
let npapers
before(async () => {
  try {
    const nps = await NewspaperFactory.setupTestDB(process.env.POSTGRES_URI)
    npapers = {
      present: [nps[0], nps[2]],
      absent: nps[1],
    }
    await ArticleFactory.setupTestDB(npapers.present, process.env.POSTGRES_URI)
  } catch (err) {
    console.error(err)
    throw err
  }
})
after(async () => {
  NewspaperFactory.cleanupTestDB()
  ArticleFactory.cleanupTestDB()
})

describe('News Organizer API', function () {
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

  describe('/store POST', function () {
    it('should be successful with consistent parameters', async () => {
      const art = ArticleFactory.create({ source: npapers.present[0].id })
      try {
        expect(await Article.fetchMany({ title: art.title })).to.have.length(0)
        const res = await conn.post('/store').send(art)
        expect(res).to.have.status(201)
        expect(await Article.fetchMany({ title: art.title })).to.have.length(1)
      } catch (err) {
        throw err
      }
    })

    describe('should return 400 when', function () {
      specify('inexistent field is passed', async () => {
        const art = ArticleFactory.create({ source: npapers.present[0].id })
        art.abcde = 1234
        try {
          const res = await conn.post('/store').send(art)
          expect(res).to.have.status(400)
          expect(res.body).to.have.ownProperty('abcde')
        } catch (err) {
          throw err
        }
      })

      specify('id is passed', async () => {
        const art = ArticleFactory.create({
          source: npapers.present[0].id,
          id: 12345,
        })
        try {
          const res = await conn.post('/store').send(art)
          expect(res).to.have.status(400)
        } catch (err) {
          throw err
        }
      })

      for (const f of ['title', 'source', 'preview']) {
        specify(`invalid ${f} is passed`, async () => {
          const art = ArticleFactory.create({
            source: npapers.present[0].id,
            [f]: ArticleFactory.bad[f],
          })
          try {
            const res = await conn.post('/store').send(art)
            expect(res).to.have.status(400)
            expect(res.body).to.have.ownProperty(f)
          } catch (err) {
            throw err
          }
        })

        specify(`${f} is missing`, async () => {
          const art = ArticleFactory.create({ source: npapers.present[0].id })
          delete art[f]
          try {
            const res = await conn.post('/store').send(art)
            expect(res).to.have.status(400)
            expect(res.body).to.have.ownProperty(f)
          } catch (err) {
            throw err
          }
        })
      }
    })
  })

  it('should return 403 if source newspaper does not exist')
})

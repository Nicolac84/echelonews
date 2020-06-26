// echelonews - Factory for test units
// Article model
'use strict'
require('dotenv').config({ path: '.env.test' })
const { Article, VolatileArticle } = require('../../models/article')
const fs = require('fs')

class ArticleFactory {
  static create(opt = {}) {
    return new VolatileArticle(Object.assign(this.uniqueParams(), opt))
  }

  static createPersistent(opt = {}) {
    return new Article(Object.assign(this.uniqueParams(), opt))
  }

  static uniqueArticleCounter = 0
  static uniqueParams() {
    const id = this.uniqueArticleCounter++
    return {
      title: `Article ${id}`,
      preview: `Preview of article ${id}`,
      origin: 'localhost/some-rss.xml',
      topics: ['some-topic'],
    }
  }

  static bad = {
    id: -123,
    title: '',
    preview: '',
  }

  static async setupTestDB(npapers, opt) {
    const existing = this.createPersistent({ source: npapers[0].id }),
      existing2 = this.createPersistent({ source: npapers[1].id }),
      nonExisting = this.createPersistent({ source: npapers[0].id })
    try {
      // Setup the database for article testing
      Article.db.setup(opt)
      await Article.db.pool
        .query(`DROP TABLE ${Article.db.table} CASCADE`)
        .catch(() => {})
      await Article.db.pool.query(fs.readFileSync('sql/article.sql').toString())
        .catch(err => { if (err.code != '42P07') throw err })

      await existing.save()
      await existing2.save()

      // Make sure that none of nonExisting ID columns will actually exist
      await nonExisting.save()
      await nonExisting.delete()

      return [existing, nonExisting, existing2]
    } catch (err) {
      throw err
    }
  }

  static async cleanupTestDB() {
    Article.db.cleanup()
  }
}

module.exports = { ArticleFactory }

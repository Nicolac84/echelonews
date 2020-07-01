// echelonews - Test Unit
// News multiplexer
'use strict'
require('dotenv').config({ path: '.env.test' })
const chai = require('chai')
const expect = chai.expect
const { NewsMultiplexer, NewsMultiplexerClient } =
  require('../../services/news-multiplexer')
const { ArticleFactory } = require('../factories/article')

describe('Article multiplexing', function() {
  before(async () => {
    try {
      await ArticleFactory.setupTestDB(process.env.POSTGRES_URI)
    } catch (err) {
      throw err
    }
  })

  it('should return a sorted array of articles with good parameters')
  it('should return an empty array with inexistent user')
  it('should return an empty array with inexistent topic')
  it('should return an empty array with inexistent countries')
})

/*
describe('NewsMultiplexer', function() {
  describe('', function() {
    
  })
})
*/

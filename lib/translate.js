/** echelonews - Passport configuration
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 * This software is licensed under the MIT license found in the file LICENSE
 * in the root directory of this repository
 */
'use strict'
const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY
const googleTranslate = require('google-translate')(API_KEY);

/** Translate an article
 * @param {Article} article - The article to translate
 * @param {string} lang - The target transation language
 * @throws The target language must be valid
 * @throws Calling the Google API must succeed
 * @returns {Promise<Article>} The article with the requested translation
 *   (also does side-effect, reading the return value is not strictly needed)
 */
function translateArticle(article, lang) {
  return new Promise((resolve, reject) => {
    if (!article) resolve(article)
    if (!lang) reject(new Error('Falsy value for target language'))
    googleTranslate.translate([article.title, article.preview], lang, (err, t) => {
      if (err) reject(err)
      if (t.length < 2)
        reject(new Error(`Translations array has length ${t.length}`))
      article.translatedTitle = t[0].translatedText
      article.translatedPreview = t[1].translatedText
      resolve(article)
    })
  })
}

module.exports = { translateArticle }

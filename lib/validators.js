/** echelonews - Custom validators
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 * This software is licensed under the MIT license found in the file LICENSE
 * in the root directory of this repository
 */
'use strict'
const { validate } = require('validable')
const { countries, languages } = require('countries-list')

function stringArray(value, options) {
  if (!options) return null
  if (!validate.isArray(value)) return 'is not an array'
  for (const x of value)
    if (!x || !validate.isString(x))
      return 'contains invalid elements'
  return null
}

function languageCode(value, options) {
  if (!options) return null
  if (!validate.isString(value)) return 'is not an array'
  if (!languages.hasOwnProperty(value)) return 'is not a valid language code'
}

function countryCode(value, options) {
  if (!options) return null
  if (!validate.isString(value)) return 'is not an array'
  if (!countries.hasOwnProperty(value)) return 'is not a valid language code'
}

function countryCodeArray(value, options) {
  if (!options) return null
  if (!validate.isArray(value)) return 'is not an array'
  for (const x of value) {
    if (!validate.isString(x)) return 'contains invalid elements'
    if (!countries.hasOwnProperty(x)) return 'contains non-country elements'
  }
}

module.exports = {
  stringArray, countryCode, languageCode, countryCodeArray
}

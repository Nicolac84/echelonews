/** echelonews - Model helpers
 * @requires validable
 * @requires perseest
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 * This software is licensed under the MIT license found in the file LICENSE
 * in the root directory of this repository
 */
"use strict";
const { aux } = require("perseest");
const Validable = require("validable");

/** On save, make the database return the id of the saved entry and set it as
 * the JS instance id
 * @param {Class} Schema - The schema extending Perseest.Class
 * @param {string} idColName - The name of the ID column
 * @returns {undefined}
 */
function setIDAfterSaving(Schema, idColName) {
  // Override default save query
  Schema.db.queries.create({
    name: "save",
    transform: ({ res }) => res.rows[0],
    generate: ({ conf, ent, columns }) => {
      const [cols, vals] = aux.entityCV(ent, columns);
      return {
        text: `INSERT INTO ${conf.table} (
    ${cols.join(", ")}
  ) VALUES (
    ${aux.placeholders(cols.length)}
  ) RETURNING ${idColName}`,
        values: vals,
      };
    },
  });

  // Retrieve and apply user ID after insertion
  Schema.db.addHook("after", "save", (params) => {
    if (!params.res.rows.length) params.ret = false;
    params.ent[idColName] = params.res.rows[0][idColName];
    params.ret = true;
  });
}

/** After having fetched a user, convert a postgres timestamp in a JS Date
 * @param {Class}
 * @param {Class} Schema - The schema extending Perseest.Class
 * @param {string} tmColName - The name of the timestamp column
 * @returns {undefined}
 */
function tm2DateAfterFetch(Schema, tmColName) {
  Schema.db.addHook("after", "fetch", (params) => {
    if (params.ent) params.ent[tmColName] = new Date(params.ent[tmColName]);
  });
}

/** Run validators before performing any default query
 * @param {Class} Schema - The schema extending Perseest.Class
 * @param {string} idColName - The name of the ID column
 * @returns {undefined}
 */
function validateBeforeQuery(Schema) {
  // Check if Schema implements Validable
  if (
    typeof Schema.prototype.validate !== "function" ||
    typeof Schema.validate !== "function" ||
    typeof Schema.validateObject !== "function"
  ) {
    throw new Error("Given schema is not a Validable class");
  }

  // Update validator
  function dbUpdateValidator({ columns, values }) {
    const props = {};
    for (let i = 0; i < columns.length; ++i) props[columns[i]] = values[i];
    const errs = Schema.validateObject(props, true);
    if (errs) throw new Validable.Error(errs);
  }

  // Save validator
  function dbSaveValidator({ ent }) {
    const errs = ent.validate();
    if (errs) throw new Validable.Error(errs);
  }

  // Delete validator (static and instance)
  function dbFetchDeleteValidator({ key, kval }) {
    const errs = Schema.validate(key, kval);
    if (errs) throw new Validable.Error(errs);
  }

  // Validate fields before performing queries on them
  Schema.db.addHook("before", "save", dbSaveValidator);
  Schema.db.addHook("before", "update", dbUpdateValidator);
  Schema.db.addHook("before", "fetch", dbFetchDeleteValidator);
  Schema.db.addHook("before", "delete", dbFetchDeleteValidator);
}

module.exports = { setIDAfterSaving, tm2DateAfterFetch, validateBeforeQuery };

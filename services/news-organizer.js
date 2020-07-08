/** echelonews - News organizer module
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
"use strict";
const express = require("express");
const jsonParser = require("body-parser").json();
const Validable = require("validable");
const { Article } = require("../models/article");
const pino = require("pino");
const pinoExpress = require("express-pino-logger");

// Fields which can be written by the API interlocutor
const UPDATE_ALLOWED = new Set(Article.db.columns.keys());
UPDATE_ALLOWED.delete("id");

const log = pino({ level: process.env.LOG_LEVEL || "info" });
const app = express();
app.use(pinoExpress({ logger: log, useLevel: "trace" }));

// Get metadata for the current user handler server instance
app.get("/", async (req, res) => {
  log.info("Requested news organizer status");
  let articles;
  try {
    const pgRes = await Article.db.pool.query(
      "SELECT COUNT(*) AS n FROM Article"
    );
    articles = pgRes.rows[0].n;
  } catch (err) {
    articles = null;
  }
  res.status(200).json({
    message: "EcheloNews News Organizer server",
    uptime: process.uptime(),
    platform: process.platform,
    databaseStatus: articles === null ? "Unavailable" : "Available",
    articles: articles,
  });
});

// Store an incoming article
app.post("/store", jsonParser, async (req, res) => {
  const errors = Validable.whitelist(req.body, UPDATE_ALLOWED);
  if (errors) {
    log.info("Validation failed while storing article\n%o", errors);
    res.status(400).json(errors);
    return;
  }

  // TODO: Check strict adding
  try {
    const art = new Article(req.body);
    await art.save();
    log.info(`Successfully stored article (id: ${art.id})`);
    res.status(201).send();
  } catch (err) {
    if (err.constructor.name === Validable.Error.name) {
      log.info("Validation failed while storing article\n%o", err.errors);
      res.status(400).json(err.errors);
    } else if (err.code === "23503") {
      // Inexistent foreign key
      const matcher = /.*\(([a-zA-Z0-9]+)\)=\((.+)\).*/;
      const fkErr = err.detail.replace(matcher, "$1 $2").split(" ");
      log.warn(`${fkErr[0]} '${fkErr[1]}' does not exist`);
      res
        .status(403)
        .json({ [fkErr[0]]: `${fkErr[0]} '${fkErr[1]}' does not exist` });
    } else {
      log.error(err);
      res.status(500).json({ message: "Internal database error. Sorry" });
    }
  }
});

// Perform the required setup operations and launch the server
app.launch = function ({ postgresUri, port = 8080 } = {}) {
  log.info("Setting up database");
  Article.db.setup(postgresUri);
  app.listen(port, () => log.info(`Server listening on port ${port}`));
};

// If this is the main module, launch the news organizer server
if (require.main === module) {
  log.info("Starting News Organizer server in standalone mode");
  app.launch({
    postgresUri: process.env.POSTGRES_URI,
    port: process.env.PORT,
  });
}

module.exports = app;

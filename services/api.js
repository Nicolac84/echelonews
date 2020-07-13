/** echelonews - Main exposed API
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
"use strict";
const express = require("express");
const jsonParser = require("body-parser").json();
const fetch = require("node-fetch");
const pino = require("pino");
const pinoExpress = require("express-pino-logger");
const Validable = require("validable");
const Auth = require("../lib/authstar");
const { User } = require("../models/user");
const { Article } = require("../models/article");
const { Feedback } = require("../models/feedback");
const { OAuthFeedback } = require("../models/oauth-feedback");
const { Newspaper } = require("../models/newspaper");
const {
  NewsMultiplexerClient,
  DEFAULT_RPC_QUEUE,
} = require("./news-multiplexer");

// Setup app and logger
const app = express();
const log = pino({ level: process.env.LOG_LEVEL || "info" });
app.use(pinoExpress({ logger: log, useLevel: "trace" }));

app.get("/", (req, res) => {
  res.status(503).json({ message: "Not Implemented" });
});

app.post("/login", jsonParser, Auth.middlewares.login);

app.post("/register", jsonParser, Auth.middlewares.register);

app.get("/profile", Auth.middlewares.jwt, async (req, res) => {
  try {
    const user = await fetchUser(req.user.id, req.user.oauth);
    if (user instanceof Error) {
      return res.status(400).json({ message: "Malformed request" });
    }
    res.status(200).json(user);
  } catch (err) {
    log.error(err);
    res.status(500).json({ message: "Internal server error. Sorry" });
  }
});

app.put("/profile", Auth.middlewares.jwt, jsonParser, async (req, res) => {
  try {
    const ret = await updateUser(req.user.id, req.body, req.user.oauth);
    if (ret instanceof Error) {
      return res.status(400).json({ message: "Malformed request" });
    }
    res.sendStatus(200);
  } catch (err) {
    log.error(err);
    res.status(500).json({ message: "Internal server error. Sorry" });
  }
});

app.get("/countries", Auth.middlewares.jwt, async (req, res) => {
  try {
    const user = await fetchUser(req.user.id, req.user.oauth);
    res.status(200).json(user.countries);
  } catch (err) {
    log.error(err);
    res.status(500).json({ message: "Internal server error. Sorry" });
  }
});

app.post("/countries", Auth.middlewares.jwt, jsonParser, async (req, res) => {
  try {
    const countries = req.body;
    const errors = User.validate("countries", countries);
    if (errors) {
      log.warn(
        `Malformed countries update attempt by user ${req.user.id}\n%o`,
        countries
      );
      return res.status(400).json({ errors });
    }
    await updateUser(req.user.id, { countries });
    res.sendStatus(200);
  } catch (err) {
    log.error(err);
    res.status(500).json({ message: "Internal server error. Sorry" });
  }
});

app.get("/topics", Auth.middlewares.jwt, async (req, res) => {
  try {
    const user = await fetchUser(req.user.id, req.user.oauth);
    res.status(200).json(user.topics);
  } catch (err) {
    log.error(err);
    res.status(500).json({ message: "Internal server error. Sorry" });
  }
});

app.post("/topics", Auth.middlewares.jwt, jsonParser, async (req, res) => {
  try {
    const topics = req.body;
    const errors = User.validate("topics", topics);
    if (errors) {
      log.warn(
        `Malformed topics update attempt by user ${req.user.id}\n%o`,
        topics
      );
      return res.status(400).json({ errors });
    }
    await updateUser(req.user.id, { topics });
    res.sendStatus(200);
  } catch (err) {
    log.error(err);
    res.status(500).json({ message: "Internal server error. Sorry" });
  }
});

app.get("/feedback", Auth.middlewares.jwt, async (req, res) => {
  try {
    const FB = req.user.oauth ? OAuthFeedback : Feedback;
    const fbs = await FB.fetchMany({ account: req.user.id });
    res.status(200).json(
      fbs.map((f) => ({
        npaper: f.npaper,
        score: f.score,
      }))
    );
  } catch (err) {
    log.error(err);
    res.status(500).json({ message: "Internal server error. Sorry" });
  }
});

app.put("/feedback", Auth.middlewares.jwt, jsonParser, async (req, res) => {
  try {
    const errors = Validable.merge(
      Validable.requirelist(req.body, ["npaper", "score"]),
      Validable.whitelist(req.body, ["npaper", "score"]),
      Feedback.validateObject(req.body, true)
    );
    if (errors) {
      log.warn(
        `User ${req.user.id} performed bad feedback update request\n%o`,
        req.body
      );
      return res.status(400).json({ errors });
    }

    const FB = req.user.oauth ? OAuthFeedback : Feedback;
    const fb = await FB.retrieve(req.user.id, req.body.npaper);
    fb.score += req.body.score;
    if (fb.exists) await fb.update("score");
    else await fb.save();
    res.sendStatus(200);
  } catch (err) {
    log.error(err);
    res.status(500).json({ message: "Internal server error. Sorry" });
  }
});

app.delete("/feedback", Auth.middlewares.jwt, async (req, res) => {
  try {
    const FB = req.user.oauth ? OAuthFeedback : Feedback;
    await FB.deleteMany({ account: req.user.id });
    res.sendStatus(200);
  } catch (err) {
    log.error(err);
    res.status(500).json({ message: "Internal server error. Sorry" });
  }
});

app.get("/news", Auth.middlewares.jwt, async (req, res) => {
  try {
    const user = await fetchUser(req.user.id, req.user.oauth);
    if (!user.topics.length || !user.countries.length) {
      return res.status(200).json([]);
    }
    const muxed = await app.muxer.multiplex({
      uid: user.id,
      countries: user.countries,
      topic: user.topics[0],
      oauth: !!req.user.oauth,
      lang: user.lang,
    });
    res.status(200).json(muxed);
  } catch (err) {
    log.error(err);
    res.status(500).json({ message: "Internal server error. Sorry" });
  }
});

app.post("/news", Auth.middlewares.jwt, jsonParser, async (req, res) => {
  try {
    const errors = Validable.merge(
      Validable.requirelist(req.body, ["topic", "countries"]),
      Validable.whitelist(req.body, ["topic", "countries", "lang"]),
      Article.validate("topics", [req.body.topic]),
      User.validate("countries", req.body.countries),
      req.body.lang && User.validate("lang", req.body.lang)
    );
    if (errors) {
      log.warn(
        `User ${req.user.id} performed bad news fetch request\n%o`,
        req.body
      );
      return res.status(400).json({ errors });
    }
    const muxed = await app.muxer.multiplex({
      uid: req.user.id,
      topic: req.body.topic,
      countries: req.body.countries,
      oauth: !!req.user.oauth,
      lang: req.body.lang || "en",
    });
    res.status(200).json(muxed);
  } catch (err) {
    log.error(err);
    res.status(500).json({ message: "Internal server error. Sorry" });
  }
});

app.get("/newspaper/:id", async (req, res) => {
  try {
    if (Newspaper.validate("id", req.params.id)) {
      log.warn("Attempted to fetch newspaper with invalid ID");
      return res.status(400).json({ id: ["Newspaper ID is not valid"] });
    }
    const np = await Newspaper.fetch("id", req.params.id);
    if (!np) {
      log.warn("Attempted to fetch inexistent newspaper");
      return res.status(404).send();
    }
    res.status(200).json({
      id: np.id,
      country: np.country,
      info: np.info,
    });
  } catch (err) {
    log.error(err);
    res.status(500).json({ message: "Internal server error. Sorry" });
  }
});

// Perform the application setup, programmatically
app.setup = async function ({
  logger,
  userHandlerUrl,
  jwtSecret,
  amqpBroker,
  muxerQueueName,
  postgresUri,
} = {}) {
  try {
    Feedback.db.setup(postgresUri);
    OAuthFeedback.db.setup(postgresUri);
    Newspaper.db.setup(postgresUri);
    Auth.setup({
      log: logger || log,
      jwtSecret: jwtSecret || process.env.JWT_SECRET,
      userHandlerUrl: userHandlerUrl || process.env.USER_HANDLER_URL,
    });
    app.muxer = new NewsMultiplexerClient({
      broker: amqpBroker,
      queueName: muxerQueueName,
    });
    await app.muxer.setup();
  } catch (err) {
    throw err;
  }
};

// Perform the required setup operations and launch the server
app.launch = async function ({ port = 8080, userHandlerUrl, jwtSecret } = {}) {
  try {
    await app.setup({
      userHandlerUrl,
      jwtSecret,
      postgresUri: process.env.POSTGRES_URI,
      amqpBroker: process.env.AMQP_BROKER,
      muxerQueueName: process.env.RPC_QUEUE_NAME || DEFAULT_RPC_QUEUE,
    });
    app.listen(port, () => log.info(`Server listening on port ${port}`));
  } catch (err) {
    throw err;
  }
};

// If this is the main module, launch the API server
if (require.main === module) {
  for (const v of [
    "POSTGRES_URI",
    "AMQP_BROKER",
    "JWT_SECRET",
    "USER_HANDLER_URL",
  ]) {
    if (!process.env[v]) {
      throw new Error(`You must define environment variable ${v}`);
    }
  }
  log.info("Launching EcheloNews RESTful API in standalone mode");
  app.launch({ port: process.env.PORT });
}

// Fetch a user calling the user handler
async function fetchUser(id, oauth) {
  try {
    if (!Number.isInteger(id) && typeof id === "string" && !/[0-9]+/.test(id)) {
      return new TypeError("User ID is not an integer");
    }
    const url =
      Auth.userHandlerUrl + (oauth ? "/oauth" : "/users/byid") + `/${id}`;
    const res = await fetch(url);
    if (!res.ok) {
      return new Error(`User handler returned status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    throw err;
  }
}

// Update a user calling the user handler
async function updateUser(id, body, oauth) {
  log.info(`Updating user ${id} (OAuth: ${!!oauth})\n%o`, body);
  try {
    if (!Number.isInteger(id) && typeof id === "string" && !/[0-9]+/.test(id)) {
      return new TypeError("User ID is not an integer");
    }
    const url =
      Auth.userHandlerUrl + (oauth ? "/oauth" : "/users/byid") + `/${id}`;
    const res = await fetch(url, {
      method: "put",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      return new Error(`User handler returned status ${res.status}`);
    }
  } catch (err) {
    throw err;
  }
}

module.exports = app;

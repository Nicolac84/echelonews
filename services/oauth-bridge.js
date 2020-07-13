/** echelonews - Bridge between frontends and user handler for OAuth users
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
"use strict";
const express = require("express");
const jsonParser = require("body-parser").json();
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const pino = require("pino");
const pinoExpress = require("express-pino-logger");

// Setup app and logger
const app = express();
const log = pino({ level: process.env.LOG_LEVEL || "info" });
app.use(pinoExpress({ logger: log, useLevel: "trace" }));

const JWT_SECRET = process.env.JWT_SECRET;
const USER_HANDLER_URL = process.env.USER_HANDLER_URL;

app.post("/oauth", jsonParser, async (req, res) => {
  try {
    const userRes = await fetch(`${USER_HANDLER_URL}/oauth`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const user = await userRes.json();
    log.info(
      `${userRes.status === 200 ? "Got" : "Created"} OAuth user ${user.id} (${
        user.name
      })`
    );
    const token = jwt.sign(
      {
        user: {
          id: user.id,
          name: user.name,
          oauth: true,
        },
      },
      JWT_SECRET
    );
    res.status(200).json({ token });
  } catch (err) {
    log.error(err);
    res.status(500).json({ message: "Internal server error. Sorry" });
  }
});

app.launch = function ({ port } = {}) {
  app.listen(port, () => log.info(`Server listening on port ${port}`));
};

if (require.main === module) {
  for (const v of ["JWT_SECRET", "USER_HANDLER_URL"]) {
    if (!process.env[v]) {
      throw new Error(`You must define environment variable ${v}`);
    }
  }
  log.info("Launching EcheloNews RESTful API in standalone mode");
  app.launch({ port: process.env.PORT || 8080 });
}

# Echelonews

EcheloNews is a news multiplexer; basically, it fetches news from all over the
world, classifying them by topic and giving them back to users according to
their preferences.

## Documentation

The entire project documentation is served with GitHub Pages at
[this address](https://Nicolac84.github.io/echelonews).

The documentation is comprehensive of OpenAPI3 specifications for _each_
microservice (including internal ones) and JSDoc documents for libraries and
code in general.

## Technologies

_node.js_ had been used to realized all the EcheloNews services and models.

The following node packages had been used:

* [express](https://expressjs.com/) as the web framework
* [amqplib](http://www.squaremobius.net/amqp.node/) to handle asynchronous calls and RPCs
* [pino](https://getpino.io) as the logger
* [perseest](https://www.npmjs.com/package/perseest) as the ORM (it uses PostgreSQL)
* [validable](https://www.npmjs.com/package/Validable) to perform validations
* [passport](http://www.passportjs.org/) to handle **local** (not OAuth) users
* [body-parser](https://www.npmjs.com/package/body-parser) to read all kinds of request bodies
* [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) to generate API authorization tokens
* [bcrypt](https://www.npmjs.com/package/bcrypt) to hash user passwords

The web frontend also makes use of
[cookie-parser](https://www.npmjs.com/package/cookie-parser) to read cookies in
a clean and painless way.

## External services

The Google OAuth2 API is used to offer OAuth user registration capabilities.

The Google Cloud Translate API is used to translate articles.

Many (potentially any number) of external HTTP services are accessed by the
news fetcher in order to retrieve RSS feeds.

## Logging

For logging, [pino](https://getpino.io) is used; log messages are printed to
_stdout_ in JSON format, and log transport must be handled outside any service,
as specified in the [12Factor App Rules](https://12factor.net/).

By default, _info_ and upper level are used for general purpose logging, and
express requests are logged using the _trace_ level (using
[express-pino-logger](https://www.npmjs.com/package/express-pino-logger)

## Testing

EcheloNews is shipped with a test suite, which uses the following NPM packages:

* [mocha](https://mochajs.org/) as the test framework
* [chai](https://www.chaijs.com/) as the assertion library
* [chai-http](https://www.chaijs.com/plugins/chai-http/) to make assertion for
RESTful APIs
* [dotenv](https://github.com/motdotla/dotenv) for environment setup (parsing
the file `.env.test`)
* [nock](https://www.npmjs.com/package/nock) for mocking HTTP(S) requests
* [sinon](https://sinonjs.org/) for programmatic mocks, fakes and stubs

These utilities are specified in the `package.json` as dev dependencies.

### Environment setup

In order to perform tests, you have to specify the following environment
variables:

**Variable** | **Description** | **Example**
:-:|---|---
`POSTGRES_URI` | URI to a postgres database | `postgres://user:pass@so.me.db/testdb`
`ENVIRONMENT` | Execution environment - Should be `test` | `test`
`LOG_LEVEL` | Minimum Pino log level - When performing tests, should be `silent` | `trace`
`PORT` | Port to which servers and APIs can be exposed | `8080`

### Performing tests

After having done a consistent setup, you can run the entire test suite with:

```sh
npm test 
```

Alternatively, you can perform single tests with _mocha_:

```sh
npx mocha --exit <test-unit-files>  # e.g.: npx mocha test/models/user.js
```

## Running services

After having performed the required setup routines (see below), you can run a
service in the following way:

```sh
SERVICE=<service-name> npm start

SERVICE=api PORT=8081 npm start  # e.g.: start the main exposed API
```

The web frontend can be run with `npm run frontend`

### Environment setup

Microservice parameters must be specified as environment variables. The absence
of these ones could result in lacks of functionalities or even aborts for a
service.

#### Common variables

The following variables are common to any microservice:

**Variable** | **Description** | **Mandatory** | **Example**
:-:|---|:-:|---
`POSTGRES_URI` | URI to the postgres database | no | `postgres://user:pass@so.me.db/testdb`
`LOG_LEVEL` | Minimum Pino log level | no | `trace`
`PORT` | Port to which servers and APIs can be exposed (only valid for RESTful services) | no | `8081`

#### Exposed RESTful API

**Variable** | **Description** | **Mandatory** | **Example**
:-:|---|:-:|---
`JWT_SECRET` | Secret key to sign Json Web Tokens | yes | `verylongandrandomstring...`
`AMQP_BROKER` | URL to the infrastructure AMQP broker | yes | `amqp://localhost`
`USER_HANDLER_URL` | URL to the user handler instance | yes | `http://localhost:8082`
`RPC_QUEUE_NAME` | Queue name to perform RPCs to the news multiplexer | no | `mux-rpc-queue`

#### OAuth Bridge

**Variable** | **Description** | **Mandatory** | **Example**
:-:|---|:-:|---
`JWT_SECRET` | Secret key to sign Json Web Tokens | yes | `verylongandrandomstring...`
`USER_HANDLER_URL` | URL to the user handler instance | yes | `http://localhost:8082`

#### News Multiplexer

**Variable** | **Description** | **Mandatory** | **Example**
:-:|---|:-:|---
`AMQP_BROKER` | URL to the infrastructure AMQP broker | yes | `amqp://localhost`
`AMQP_QUEUE_NAME` | Queue name to perform RPCs to the news multiplexer | no | `mux-rpc-queue`
`AMQP_PREFETCH` | Prefetch value for the AMQP consumer | no | `1`
`GOOGLE_TRANSLATE_API_KEY` | API key for the Google Translate external service | no | `<someapikey>`

**NOTES**:

* Not defining `GOOGLE_TRANSLATE_API_KEY` will result in a lack of translation service

#### News Fetcher

**Variable** | **Description** | **Mandatory** | **Example**
:-:|---|:-:|---
`ORGANIZER_URL` | URL to the news organizer instance | yes | `http://localhost:8084`
`INTERVAL` | News fetching interval, in milliseconds | no | `300000`

#### Web Frontend

**Variable** | **Description** | **Mandatory** | **Example**
:-:|---|:-:|---
`API_URL` | URL to the main exposed API instance | no | `http://localhost:8081`
`OAUTH_BRIDGE_URL` | URL to the OAuth bridge instance | no | `http://localhost:8083`
`GOOGLE_CLIENT_ID` | Google Cloud client ID | no |`1234abcde.apps.googleusercontent.com`
`GOOGLE_CLIENT_SECRET` | Google Cloud client secret | no | `somelongrandomstring`

**NOTES**:

* The web frontend does not need to access the database
* Not defining `API_URL` will result in a total lack of service
* Not defining Google-related variables will make the OAuth functionalities unavailable

### Database setup

In order to setup the database, you must connect to a PostgreSQL db and execute
the SQL scripts under the `sql` directory. After that, you have to generate a
postgres URL in the form:

```
postgres://user:password@host:port/dbname
```


## License

MIT License

Copyright (c) 2020 Nicola Colao  
Copyright (c) 2020 Paolo Lucchesi  
Copyright (c) 2020 Dejan Nuzzi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

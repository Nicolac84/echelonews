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

## Logging

For logging, [pino](https://getpino.io) is used; log messages are printed to
_stdout_ in JSON format, and log transport must be handled outside any service.

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
* [nyc](https://istanbul.js.org/) for test coverage
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
`ORGANIZER_URL` | URL for the news organizer service | `http://localhost:8081`
`PORT` | Port to which servers and APIs can be exposed | `8080`

### Performing tests

After having done a consistent setup, you can run the entire test suite with:

```sh
# Just run tests
npm test 

# Run tests and verify test coverage with nyc
npm run coverage
```

Alternatively, you can perform single tests with _mocha_:

```sh
npx mocha <test-unit-files>  # e.g.: npx mocha test/models/user.js
```

### Testing manually

Of course, you can launch and test manually any microservice. After having
initialized the required environment variables and the database (refer to the
queries under the `sql/` directory), you can launch a service with:

```sh
# Start a service, automatically filtering pino logs with pino-pretty
SERVICE=<service-name> npm start
```

If the `PORT` environment variable is not specified `8080` will be used.

You can verify the general status of any microservice with a `GET /` request.


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

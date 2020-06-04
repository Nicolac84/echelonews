---
title: Homepage
permalink: /
---

EcheloNews is a news multiplexer; basically, it fetches news from all over the
world, classifying them by topic and giving them back to users according to
their preferences.

<small>
Copyright (c) 2020 Nicola Colao  
Copyright (c) 2020 Paolo Lucchesi  
Copyright (c) 2020 Dejan Nuzzi  
EcheloNews is released under the **MIT license**
</small>

## Documentation

### RESTful APIs

EcheloNews internal and external RESTful APIs are designed and built as a set
of OpenAPI3 YAML specifications. To view them, you can visit the following
links:

* [Exposed API]({{ site.url }}/openapi/external)
* [Internal User Handler]({{ site.url }}/openapi/users)

### Libraries and Programming APIs

Libraries (and code portions in general) are documented with JSDoc; the
documentation is available at [this page]({{ site.url }}/jsdoc/models)

## Architecture

EcheloNews is designed as a set of loosely coupled modules, which can be easily
turned into microservices. The architecture is described as follows:

<p align="center">
  <img src="{{ site.url }}/architecture/architecture.png" />
</p>

**NOTE**:

* Red edges represents external interactions
* Green edges represents internal RESTful calls
* Orange edges represents internal AMQP calls

### Modules

#### RESTful API
The main EcheloNews interface, built on top of standard HTTP verbs with the
REST paradigm and delivered as SaaS

#### Web Frontend
A website frontend, built on top of the RESTful API

#### News fetcher
Fetch news via the RSS protocol from various websites (with long-time
polling), and pass them to the news organizer as a JSON object

#### News organizer
Organize news and save them in a permanent data structure (e.g. SQL database)

#### News multiplexer
Multiplex news according to topic or category and return them to a user
interface microservice (on-demand).
**NOTE**: It calls the Google Translate API to translate news feeds'
description and title

#### Logger
Keep track of logs, storing them in an isolated database

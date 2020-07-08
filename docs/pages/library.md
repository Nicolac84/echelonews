---
title: JSDoc | Library
permalink: /jsdoc/library
---

# JSDoc documentation for library functions

## Classes

<dl>
<dt><a href="#AuthStar">AuthStar</a></dt>
<dd><p>Own-rolled authorization framework for the EcheloNews API</p>
</dd>
</dl>

## Members

<dl>
<dt><a href="#login">login</a></dt>
<dd><p>JWT-based authorization middleware</p>
</dd>
<dt><a href="#register">register</a></dt>
<dd><p>Login middleware</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#setIDAfterSaving">setIDAfterSaving(Schema, idColName)</a> ⇒ <code>undefined</code></dt>
<dd><p>On save, make the database return the id of the saved entry and set it as
the JS instance id</p>
</dd>
<dt><a href="#tm2DateAfterFetch">tm2DateAfterFetch(Schema, Schema, tmColName)</a> ⇒ <code>undefined</code></dt>
<dd><p>After having fetched a user, convert a postgres timestamp in a JS Date</p>
</dd>
<dt><a href="#validateBeforeQuery">validateBeforeQuery(Schema, idColName)</a> ⇒ <code>undefined</code></dt>
<dd><p>Run validators before performing any default query</p>
</dd>
<dt><a href="#translateArticle">translateArticle(article, lang)</a> ⇒ <code>Promise.&lt;Article&gt;</code></dt>
<dd><p>Translate an article</p>
</dd>
<dt><a href="#stringArray">stringArray(value, options)</a> ⇒ <code>string</code> | <code>null</code></dt>
<dd><p>Check if something is an array of non-blank strings</p>
</dd>
<dt><a href="#languageCode">languageCode(value, options)</a> ⇒ <code>string</code> | <code>null</code></dt>
<dd><p>Check if something is a valid ISO language code</p>
</dd>
<dt><a href="#countryCode">countryCode(value, options)</a> ⇒ <code>string</code> | <code>null</code></dt>
<dd><p>Check if something is a valid ISO country code</p>
</dd>
<dt><a href="#countryCodeArray">countryCodeArray(value, options)</a> ⇒ <code>string</code> | <code>null</code></dt>
<dd><p>Check if something is an array of valid ISO country codes</p>
</dd>
</dl>

<a name="AuthStar"></a>

## AuthStar
Own-rolled authorization framework for the EcheloNews API

**Kind**: global class  

* [AuthStar](#AuthStar)
    * _instance_
        * [.loginStrategy](#AuthStar+loginStrategy)
        * [.loginMidware](#AuthStar+loginMidware)
        * [.middlewares](#AuthStar+middlewares)
    * _static_
        * [.setup(opt)](#AuthStar.setup) ⇒ <code>Class</code>
        * [.jwtMidware()](#AuthStar.jwtMidware)
        * [.registerMidware()](#AuthStar.registerMidware)

<a name="AuthStar+loginStrategy"></a>

### authStar.loginStrategy
Passport strategy for local users login

**Kind**: instance property of [<code>AuthStar</code>](#AuthStar)  
<a name="AuthStar+loginMidware"></a>

### authStar.loginMidware
Express/Connect middleware for local users login

**Kind**: instance property of [<code>AuthStar</code>](#AuthStar)  
<a name="AuthStar+middlewares"></a>

### authStar.middlewares
AuthStar middlewares

**Kind**: instance property of [<code>AuthStar</code>](#AuthStar)  
<a name="AuthStar.setup"></a>

### AuthStar.setup(opt) ⇒ <code>Class</code>
Setup Authorization framework

**Kind**: static method of [<code>AuthStar</code>](#AuthStar)  
**Returns**: <code>Class</code> - The AuthStar class  

| Param | Type | Description |
| --- | --- | --- |
| opt | <code>object</code> | Function parameters |
| opt.log | <code>object</code> | Pino logger used by the application |
| opt.userHandlerUrl | <code>string</code> | URL to the User Handler API |

<a name="AuthStar.jwtMidware"></a>

### AuthStar.jwtMidware()
Express/Connect middleware for user authorization via Json Web Tokens

**Kind**: static method of [<code>AuthStar</code>](#AuthStar)  
<a name="AuthStar.registerMidware"></a>

### AuthStar.registerMidware()
Express/Connect middleware for local users registration

**Kind**: static method of [<code>AuthStar</code>](#AuthStar)  
<a name="login"></a>

## login
JWT-based authorization middleware

**Kind**: global variable  
<a name="register"></a>

## register
Login middleware

**Kind**: global variable  
<a name="setIDAfterSaving"></a>

## setIDAfterSaving(Schema, idColName) ⇒ <code>undefined</code>
On save, make the database return the id of the saved entry and set it as
the JS instance id

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| Schema | <code>Class</code> | The schema extending Perseest.Class |
| idColName | <code>string</code> | The name of the ID column |

<a name="tm2DateAfterFetch"></a>

## tm2DateAfterFetch(Schema, Schema, tmColName) ⇒ <code>undefined</code>
After having fetched a user, convert a postgres timestamp in a JS Date

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| Schema | <code>Class</code> |  |
| Schema | <code>Class</code> | The schema extending Perseest.Class |
| tmColName | <code>string</code> | The name of the timestamp column |

<a name="validateBeforeQuery"></a>

## validateBeforeQuery(Schema, idColName) ⇒ <code>undefined</code>
Run validators before performing any default query

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| Schema | <code>Class</code> | The schema extending Perseest.Class |
| idColName | <code>string</code> | The name of the ID column |

<a name="translateArticle"></a>

## translateArticle(article, lang) ⇒ <code>Promise.&lt;Article&gt;</code>
Translate an article

**Kind**: global function  
**Returns**: <code>Promise.&lt;Article&gt;</code> - The article with the requested translation
  (also does side-effect, reading the return value is not strictly needed)  
**Throws**:

- The target language must be valid
- Calling the Google API must succeed


| Param | Type | Description |
| --- | --- | --- |
| article | <code>Article</code> | The article to translate |
| lang | <code>string</code> | The target transation language |

<a name="stringArray"></a>

## stringArray(value, options) ⇒ <code>string</code> \| <code>null</code>
Check if something is an array of non-blank strings

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - a string on validation error, null otherwise  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The value to validate |
| options | <code>boolean</code> | Validation options |

<a name="languageCode"></a>

## languageCode(value, options) ⇒ <code>string</code> \| <code>null</code>
Check if something is a valid ISO language code

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - a string on validation error, null otherwise  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The value to validate |
| options | <code>boolean</code> | Validation options |

<a name="countryCode"></a>

## countryCode(value, options) ⇒ <code>string</code> \| <code>null</code>
Check if something is a valid ISO country code

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - a string on validation error, null otherwise  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The value to validate |
| options | <code>boolean</code> | Validation options |

<a name="countryCodeArray"></a>

## countryCodeArray(value, options) ⇒ <code>string</code> \| <code>null</code>
Check if something is an array of valid ISO country codes

**Kind**: global function  
**Returns**: <code>string</code> \| <code>null</code> - a string on validation error, null otherwise  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>\*</code> | The value to validate |
| options | <code>boolean</code> | Validation options |


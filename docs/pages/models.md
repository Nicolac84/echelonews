---
title: Library documentation - Models
permalink: '/jsdoc/models'
---

## Modules

<dl>
<dt><a href="#module_perseest-helper">perseest-helper</a></dt>
<dd><p>echelonews - Model helpers</p>
</dd>
</dl>

## Classes

<dl>
<dt><a href="#VolatileArticle">VolatileArticle</a></dt>
<dd><p>Article, with no persistence support</p>
</dd>
<dt><a href="#Article">Article</a> ⇐ <code><a href="#VolatileArticle">VolatileArticle</a></code></dt>
<dd><p>Article with persistence capability via the perseest package</p>
</dd>
<dt><a href="#VolatileNewspaper">VolatileNewspaper</a></dt>
<dd><p>Newspaper, with no persistence support</p>
</dd>
<dt><a href="#Newspaper">Newspaper</a> ⇐ <code><a href="#VolatileNewspaper">VolatileNewspaper</a></code></dt>
<dd><p>Newspaper with persistence capability via the perseest package</p>
</dd>
<dt><a href="#VolatileUser">VolatileUser</a></dt>
<dd><p>User entity, with no support for persistence</p>
</dd>
<dt><a href="#User">User</a> ⇐ <code><a href="#VolatileUser">VolatileUser</a></code></dt>
<dd><p>User with persistence capability via the perseest package</p>
</dd>
</dl>

<a name="module_perseest-helper"></a>

## perseest-helper
echelonews - Model helpers

**Requires**: <code>module:validable</code>, <code>module:perseest</code>  
**License**: Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
All rights reserved
This software is licensed under the MIT license found in the file LICENSE
in the root directory of this repository  

* [perseest-helper](#module_perseest-helper)
    * [~setIDAfterSaving(Schema, idColName)](#module_perseest-helper..setIDAfterSaving) ⇒ <code>undefined</code>
    * [~tm2DateAfterFetch(Schema, Schema, tmColName)](#module_perseest-helper..tm2DateAfterFetch) ⇒ <code>undefined</code>
    * [~validateBeforeQuery(Schema, idColName)](#module_perseest-helper..validateBeforeQuery) ⇒ <code>undefined</code>

<a name="module_perseest-helper..setIDAfterSaving"></a>

### perseest-helper~setIDAfterSaving(Schema, idColName) ⇒ <code>undefined</code>
On save, make the database return the id of the saved entry and set it as
the JS instance id

**Kind**: inner method of [<code>perseest-helper</code>](#module_perseest-helper)  

| Param | Type | Description |
| --- | --- | --- |
| Schema | <code>Class</code> | The schema extending Perseest.Class |
| idColName | <code>string</code> | The name of the ID column |

<a name="module_perseest-helper..tm2DateAfterFetch"></a>

### perseest-helper~tm2DateAfterFetch(Schema, Schema, tmColName) ⇒ <code>undefined</code>
After having fetched a user, convert a postgres timestamp in a JS Date

**Kind**: inner method of [<code>perseest-helper</code>](#module_perseest-helper)  

| Param | Type | Description |
| --- | --- | --- |
| Schema | <code>Class</code> |  |
| Schema | <code>Class</code> | The schema extending Perseest.Class |
| tmColName | <code>string</code> | The name of the timestamp column |

<a name="module_perseest-helper..validateBeforeQuery"></a>

### perseest-helper~validateBeforeQuery(Schema, idColName) ⇒ <code>undefined</code>
Run validators before performing any default query

**Kind**: inner method of [<code>perseest-helper</code>](#module_perseest-helper)  

| Param | Type | Description |
| --- | --- | --- |
| Schema | <code>Class</code> | The schema extending Perseest.Class |
| idColName | <code>string</code> | The name of the ID column |

<a name="VolatileArticle"></a>

## VolatileArticle
Article, with no persistence support

**Kind**: global class  

* [VolatileArticle](#VolatileArticle)
    * [new VolatileArticle(opt)](#new_VolatileArticle_new)
    * [.constraints](#VolatileArticle+constraints) : <code>object</code>

<a name="new_VolatileArticle_new"></a>

### new VolatileArticle(opt)
Instantiate a new Article


| Param | Type | Description |
| --- | --- | --- |
| opt | <code>object</code> | Constructor parameters |
| opt.id | <code>integer</code> | Article univocal ID |
| opt.source | <code>integer</code> | Article newspaper |
| opt.title | <code>string</code> | Article title |
| opt.preview | <code>string</code> | Article short description |
| opt.origin | <code>string</code> | Reference URL to the full article |
| opt.topics | <code>Array.&lt;string&gt;</code> | Treated topics |
| opt.created | <code>Date</code> | Article creation date and time |

<a name="VolatileArticle+constraints"></a>

### volatileArticle.constraints : <code>object</code>
Constraints on Article instance properties

**Kind**: instance constant of [<code>VolatileArticle</code>](#VolatileArticle)  
<a name="Article"></a>

## Article ⇐ [<code>VolatileArticle</code>](#VolatileArticle)
Article with persistence capability via the perseest package

**Kind**: global class  
**Extends**: [<code>VolatileArticle</code>](#VolatileArticle)  

* [Article](#Article) ⇐ [<code>VolatileArticle</code>](#VolatileArticle)
    * [new Article()](#new_Article_new)
    * [.db](#Article+db)
    * [.constraints](#VolatileArticle+constraints) : <code>object</code>

<a name="new_Article_new"></a>

### new Article()
Create a new persistent article

<a name="Article+db"></a>

### article.db
Database configuration for perseest

**Kind**: instance property of [<code>Article</code>](#Article)  
<a name="VolatileArticle+constraints"></a>

### article.constraints : <code>object</code>
Constraints on Article instance properties

**Kind**: instance constant of [<code>Article</code>](#Article)  
**Overrides**: [<code>constraints</code>](#VolatileArticle+constraints)  
<a name="VolatileNewspaper"></a>

## VolatileNewspaper
Newspaper, with no persistence support

**Kind**: global class  

* [VolatileNewspaper](#VolatileNewspaper)
    * [new VolatileNewspaper(opt, sourceType, country, info)](#new_VolatileNewspaper_new)
    * [.constraints](#VolatileNewspaper+constraints) : <code>object</code>

<a name="new_VolatileNewspaper_new"></a>

### new VolatileNewspaper(opt, sourceType, country, info)
Instantiate a new Newspaper


| Param | Type | Description |
| --- | --- | --- |
| opt | <code>object</code> | Constructor parameters |
| opt.id | <code>integer</code> | Newspaper univocal ID |
| sourceType | <code>string</code> | Newspaper type (e.g. RSS, Website...) |
| country | <code>string</code> | Newspaper origin country |
| info | <code>object</code> | Additional metadata for the newspaper |

<a name="VolatileNewspaper+constraints"></a>

### volatileNewspaper.constraints : <code>object</code>
Constraints on Newspaper instance properties

**Kind**: instance constant of [<code>VolatileNewspaper</code>](#VolatileNewspaper)  
<a name="Newspaper"></a>

## Newspaper ⇐ [<code>VolatileNewspaper</code>](#VolatileNewspaper)
Newspaper with persistence capability via the perseest package

**Kind**: global class  
**Extends**: [<code>VolatileNewspaper</code>](#VolatileNewspaper)  

* [Newspaper](#Newspaper) ⇐ [<code>VolatileNewspaper</code>](#VolatileNewspaper)
    * [.db](#Newspaper+db)
    * [.constraints](#VolatileNewspaper+constraints) : <code>object</code>

<a name="Newspaper+db"></a>

### newspaper.db
Database configuration for perseest

**Kind**: instance property of [<code>Newspaper</code>](#Newspaper)  
<a name="VolatileNewspaper+constraints"></a>

### newspaper.constraints : <code>object</code>
Constraints on Newspaper instance properties

**Kind**: instance constant of [<code>Newspaper</code>](#Newspaper)  
<a name="VolatileUser"></a>

## VolatileUser
User entity, with no support for persistence

**Kind**: global class  

* [VolatileUser](#VolatileUser)
    * [new VolatileUser(opt)](#new_VolatileUser_new)
    * _instance_
        * [.constraints](#VolatileUser+constraints) : <code>object</code>
        * [.BCRYPT_SALT_ROUNDS](#VolatileUser+BCRYPT_SALT_ROUNDS) : <code>number</code>
        * [.toString()](#VolatileUser+toString)
        * [.export()](#VolatileUser+export) ⇒ <code>object</code>
        * [.setPassword(pass)](#VolatileUser+setPassword) ⇒ <code>undefined</code>
        * [.authenticate(pass)](#VolatileUser+authenticate) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * _static_
        * [.create(opt)](#VolatileUser.create) ⇒ [<code>VolatileUser</code>](#VolatileUser)

<a name="new_VolatileUser_new"></a>

### new VolatileUser(opt)
Instantiate a new User


| Param | Type | Description |
| --- | --- | --- |
| opt | <code>object</code> | Constructor parameters |
| opt.id | <code>number</code> | User univocal ID |
| opt.name | <code>string</code> | Username |
| opt.email | <code>string</code> | User e-mail |
| opt.pass | <code>string</code> | User plaintext password |
| opt.hash | <code>string</code> | User hashed password |
| opt.created | <code>Date</code> | User creation timestamp |
| opt.googleId | <code>number</code> | Google account ID for the user |
| opt.countries | <code>Array.&lt;String&gt;</code> | Countries in the user preferences |
| opt.topics | <code>Array.&lt;String&gt;</code> | Countries in the user preferences |

<a name="VolatileUser+constraints"></a>

### volatileUser.constraints : <code>object</code>
Constraints on User instance properties

**Kind**: instance constant of [<code>VolatileUser</code>](#VolatileUser)  
<a name="VolatileUser+BCRYPT_SALT_ROUNDS"></a>

### volatileUser.BCRYPT\_SALT\_ROUNDS : <code>number</code>
BCrypt hash cost

**Kind**: instance constant of [<code>VolatileUser</code>](#VolatileUser)  
<a name="VolatileUser+toString"></a>

### volatileUser.toString()
Return a string representation of the user

**Kind**: instance method of [<code>VolatileUser</code>](#VolatileUser)  
<a name="VolatileUser+export"></a>

### volatileUser.export() ⇒ <code>object</code>
**Kind**: instance method of [<code>VolatileUser</code>](#VolatileUser)  
**Returns**: <code>object</code> - A sharing-safe representation of this user  
<a name="VolatileUser+setPassword"></a>

### volatileUser.setPassword(pass) ⇒ <code>undefined</code>
Set user password

**Kind**: instance method of [<code>VolatileUser</code>](#VolatileUser)  
**Throws**:

- Password must be valid


| Param | Type | Description |
| --- | --- | --- |
| pass | <code>string</code> | Plaintext password |

<a name="VolatileUser+authenticate"></a>

### volatileUser.authenticate(pass) ⇒ <code>Promise.&lt;boolean&gt;</code>
Authenticate a user with a password

**Kind**: instance method of [<code>VolatileUser</code>](#VolatileUser)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true if given password matches, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| pass | <code>string</code> | User password |

<a name="VolatileUser.create"></a>

### VolatileUser.create(opt) ⇒ [<code>VolatileUser</code>](#VolatileUser)
Create a user, hashing its plaintext password if given

**Kind**: static method of [<code>VolatileUser</code>](#VolatileUser)  
**Returns**: [<code>VolatileUser</code>](#VolatileUser) - A new class instance  

| Param | Type | Description |
| --- | --- | --- |
| opt | <code>object</code> | Creation parameters, as for the User constructor |

<a name="User"></a>

## User ⇐ [<code>VolatileUser</code>](#VolatileUser)
User with persistence capability via the perseest package

**Kind**: global class  
**Extends**: [<code>VolatileUser</code>](#VolatileUser)  

* [User](#User) ⇐ [<code>VolatileUser</code>](#VolatileUser)
    * [.db](#User+db)
    * [.constraints](#VolatileUser+constraints) : <code>object</code>
    * [.BCRYPT_SALT_ROUNDS](#VolatileUser+BCRYPT_SALT_ROUNDS) : <code>number</code>
    * [.toString()](#VolatileUser+toString)
    * [.export()](#VolatileUser+export) ⇒ <code>object</code>
    * [.setPassword(pass)](#VolatileUser+setPassword) ⇒ <code>undefined</code>
    * [.authenticate(pass)](#VolatileUser+authenticate) ⇒ <code>Promise.&lt;boolean&gt;</code>

<a name="User+db"></a>

### user.db
Database configuration for perseest

**Kind**: instance property of [<code>User</code>](#User)  
<a name="VolatileUser+constraints"></a>

### user.constraints : <code>object</code>
Constraints on User instance properties

**Kind**: instance constant of [<code>User</code>](#User)  
<a name="VolatileUser+BCRYPT_SALT_ROUNDS"></a>

### user.BCRYPT\_SALT\_ROUNDS : <code>number</code>
BCrypt hash cost

**Kind**: instance constant of [<code>User</code>](#User)  
<a name="VolatileUser+toString"></a>

### user.toString()
Return a string representation of the user

**Kind**: instance method of [<code>User</code>](#User)  
<a name="VolatileUser+export"></a>

### user.export() ⇒ <code>object</code>
**Kind**: instance method of [<code>User</code>](#User)  
**Returns**: <code>object</code> - A sharing-safe representation of this user  
<a name="VolatileUser+setPassword"></a>

### user.setPassword(pass) ⇒ <code>undefined</code>
Set user password

**Kind**: instance method of [<code>User</code>](#User)  
**Throws**:

- Password must be valid


| Param | Type | Description |
| --- | --- | --- |
| pass | <code>string</code> | Plaintext password |

<a name="VolatileUser+authenticate"></a>

### user.authenticate(pass) ⇒ <code>Promise.&lt;boolean&gt;</code>
Authenticate a user with a password

**Kind**: instance method of [<code>User</code>](#User)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true if given password matches, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| pass | <code>string</code> | User password |


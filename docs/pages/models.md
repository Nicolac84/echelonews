---
title: JSDoc | Models
permalink: /jsdoc/models
---

# JSDoc documentation for models

## Classes

<dl>
<dt><a href="#VolatileArticle">VolatileArticle</a></dt>
<dd><p>Article, with no persistence support</p>
</dd>
<dt><a href="#Article">Article</a> ⇐ <code><a href="#VolatileArticle">VolatileArticle</a></code></dt>
<dd><p>Article with persistence capability via the perseest package</p>
</dd>
<dt><a href="#VolatileFeedback">VolatileFeedback</a></dt>
<dd><p>User feedback, with no persistence support</p>
</dd>
<dt><a href="#Feedback">Feedback</a> ⇐ <code><a href="#VolatileFeedback">VolatileFeedback</a></code></dt>
<dd><p>Feedback with persistence capability via the perseest package</p>
</dd>
<dt><a href="#VolatileNewspaper">VolatileNewspaper</a></dt>
<dd><p>Newspaper, with no persistence support</p>
</dd>
<dt><a href="#Newspaper">Newspaper</a> ⇐ <code><a href="#VolatileNewspaper">VolatileNewspaper</a></code></dt>
<dd><p>Newspaper with persistence capability via the perseest package</p>
</dd>
<dt><a href="#VolatileOAuthFeedback">VolatileOAuthFeedback</a></dt>
<dd><p>User feedback, with no persistence support</p>
</dd>
<dt><a href="#OAuthFeedback">OAuthFeedback</a> ⇐ <code><a href="#VolatileOAuthFeedback">VolatileOAuthFeedback</a></code></dt>
<dd><p>OAuthFeedback with persistence capability via the perseest package</p>
</dd>
<dt><a href="#VolatileOAuthUser">VolatileOAuthUser</a></dt>
<dd><p>OAuth user entity, with no support for persistence</p>
</dd>
<dt><a href="#OAuthUser">OAuthUser</a> ⇐ <code><a href="#VolatileOAuthUser">VolatileOAuthUser</a></code></dt>
<dd><p>OAuthUser with persistence capability via the perseest package</p>
</dd>
<dt><a href="#VolatileUser">VolatileUser</a></dt>
<dd><p>User entity, with no support for persistence</p>
</dd>
<dt><a href="#User">User</a> ⇐ <code><a href="#VolatileUser">VolatileUser</a></code></dt>
<dd><p>User with persistence capability via the perseest package</p>
</dd>
</dl>

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
    * _instance_
        * [.db](#Article+db)
        * [.constraints](#VolatileArticle+constraints) : <code>object</code>
    * _static_
        * [.multiplex(opt)](#Article.multiplex) ⇒ [<code>Array.&lt;Article&gt;</code>](#Article)

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
<a name="Article.multiplex"></a>

### Article.multiplex(opt) ⇒ [<code>Array.&lt;Article&gt;</code>](#Article)
Multiplex articles, with a single country

**Kind**: static method of [<code>Article</code>](#Article)  
**Returns**: [<code>Array.&lt;Article&gt;</code>](#Article) - An ordered collection of articles  

| Param | Type | Description |
| --- | --- | --- |
| opt | <code>object</code> | Constructor parameters |
| opt.uid | <code>number</code> | Reference user ID |
| opt.topic | <code>string</code> | Topic to multiplex |
| opt.countries | <code>Array.&lt;string&gt;</code> | Countries to multiplex |
| opt.oauth | <code>boolean</code> | Multiplex for OAuth users? |

<a name="VolatileFeedback"></a>

## VolatileFeedback
User feedback, with no persistence support

**Kind**: global class  

* [VolatileFeedback](#VolatileFeedback)
    * [new VolatileFeedback(opt)](#new_VolatileFeedback_new)
    * [.constraints](#VolatileFeedback+constraints) : <code>object</code>

<a name="new_VolatileFeedback_new"></a>

### new VolatileFeedback(opt)
Create a new feedback


| Param | Type | Description |
| --- | --- | --- |
| opt | <code>object</code> | Constructor parameters |
| opt.account | <code>number</code> | Related user id |
| opt.npaper | <code>number</code> | Related newspaper ID |
| opt.score | <code>number</code> | Newspaper score |

<a name="VolatileFeedback+constraints"></a>

### volatileFeedback.constraints : <code>object</code>
Constraints on Feedback instance properties

**Kind**: instance constant of [<code>VolatileFeedback</code>](#VolatileFeedback)  
<a name="Feedback"></a>

## Feedback ⇐ [<code>VolatileFeedback</code>](#VolatileFeedback)
Feedback with persistence capability via the perseest package

**Kind**: global class  
**Extends**: [<code>VolatileFeedback</code>](#VolatileFeedback)  

* [Feedback](#Feedback) ⇐ [<code>VolatileFeedback</code>](#VolatileFeedback)
    * [new Feedback()](#new_Feedback_new)
    * _instance_
        * [.db](#Feedback+db)
        * [.constraints](#VolatileFeedback+constraints) : <code>object</code>
    * _static_
        * [.retrieve(account, npaper)](#Feedback.retrieve) ⇒ [<code>Promise.&lt;Feedback&gt;</code>](#Feedback)

<a name="new_Feedback_new"></a>

### new Feedback()
Create a new persistent article

<a name="Feedback+db"></a>

### feedback.db
Database configuration for perseest

**Kind**: instance property of [<code>Feedback</code>](#Feedback)  
<a name="VolatileFeedback+constraints"></a>

### feedback.constraints : <code>object</code>
Constraints on Feedback instance properties

**Kind**: instance constant of [<code>Feedback</code>](#Feedback)  
**Overrides**: [<code>constraints</code>](#VolatileFeedback+constraints)  
<a name="Feedback.retrieve"></a>

### Feedback.retrieve(account, npaper) ⇒ [<code>Promise.&lt;Feedback&gt;</code>](#Feedback)
Retrieve a feedback by user/newspaper tuple

**Kind**: static method of [<code>Feedback</code>](#Feedback)  
**Returns**: [<code>Promise.&lt;Feedback&gt;</code>](#Feedback) - The requested feedback, with a score of 0 if
  it does not exist  

| Param | Type | Description |
| --- | --- | --- |
| account | <code>number</code> | User ID |
| npaper | <code>number</code> | Newspaper ID |

<a name="VolatileNewspaper"></a>

## VolatileNewspaper
Newspaper, with no persistence support

**Kind**: global class  

* [VolatileNewspaper](#VolatileNewspaper)
    * [new VolatileNewspaper(opt, sourceType, country, info)](#new_VolatileNewspaper_new)
    * [.constraints](#VolatileNewspaper+constraints) : <code>object</code>
    * [.language()](#VolatileNewspaper+language) ⇒ <code>string</code>

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
<a name="VolatileNewspaper+language"></a>

### volatileNewspaper.language() ⇒ <code>string</code>
Get the language of the newspaper origin country

**Kind**: instance method of [<code>VolatileNewspaper</code>](#VolatileNewspaper)  
**Returns**: <code>string</code> - The language code for the newspaper  
<a name="Newspaper"></a>

## Newspaper ⇐ [<code>VolatileNewspaper</code>](#VolatileNewspaper)
Newspaper with persistence capability via the perseest package

**Kind**: global class  
**Extends**: [<code>VolatileNewspaper</code>](#VolatileNewspaper)  

* [Newspaper](#Newspaper) ⇐ [<code>VolatileNewspaper</code>](#VolatileNewspaper)
    * [new Newspaper()](#new_Newspaper_new)
    * [.db](#Newspaper+db)
    * [.constraints](#VolatileNewspaper+constraints) : <code>object</code>
    * [.language()](#VolatileNewspaper+language) ⇒ <code>string</code>

<a name="new_Newspaper_new"></a>

### new Newspaper()
Create a new persistent newspaper

<a name="Newspaper+db"></a>

### newspaper.db
Database configuration for perseest

**Kind**: instance property of [<code>Newspaper</code>](#Newspaper)  
<a name="VolatileNewspaper+constraints"></a>

### newspaper.constraints : <code>object</code>
Constraints on Newspaper instance properties

**Kind**: instance constant of [<code>Newspaper</code>](#Newspaper)  
**Overrides**: [<code>constraints</code>](#VolatileNewspaper+constraints)  
<a name="VolatileNewspaper+language"></a>

### newspaper.language() ⇒ <code>string</code>
Get the language of the newspaper origin country

**Kind**: instance method of [<code>Newspaper</code>](#Newspaper)  
**Overrides**: [<code>language</code>](#VolatileNewspaper+language)  
**Returns**: <code>string</code> - The language code for the newspaper  
<a name="VolatileOAuthFeedback"></a>

## VolatileOAuthFeedback
User feedback, with no persistence support

**Kind**: global class  

* [VolatileOAuthFeedback](#VolatileOAuthFeedback)
    * [new VolatileOAuthFeedback(opt)](#new_VolatileOAuthFeedback_new)
    * [.oauth](#VolatileOAuthFeedback+oauth) ⇒ <code>boolean</code>
    * [.constraints](#VolatileOAuthFeedback+constraints) : <code>object</code>

<a name="new_VolatileOAuthFeedback_new"></a>

### new VolatileOAuthFeedback(opt)
Create a new feedback


| Param | Type | Description |
| --- | --- | --- |
| opt | <code>object</code> | Constructor parameters |
| opt.account | <code>number</code> | Related OAuth user id |
| opt.npaper | <code>number</code> | Related newspaper ID |
| opt.score | <code>number</code> | Newspaper score |

<a name="VolatileOAuthFeedback+oauth"></a>

### volatileOAuthFeedback.oauth ⇒ <code>boolean</code>
Does the feedback belong to an oauth user? (always true)

**Kind**: instance property of [<code>VolatileOAuthFeedback</code>](#VolatileOAuthFeedback)  
<a name="VolatileOAuthFeedback+constraints"></a>

### volatileOAuthFeedback.constraints : <code>object</code>
Constraints on OAuthFeedback instance properties

**Kind**: instance constant of [<code>VolatileOAuthFeedback</code>](#VolatileOAuthFeedback)  
<a name="OAuthFeedback"></a>

## OAuthFeedback ⇐ [<code>VolatileOAuthFeedback</code>](#VolatileOAuthFeedback)
OAuthFeedback with persistence capability via the perseest package

**Kind**: global class  
**Extends**: [<code>VolatileOAuthFeedback</code>](#VolatileOAuthFeedback)  

* [OAuthFeedback](#OAuthFeedback) ⇐ [<code>VolatileOAuthFeedback</code>](#VolatileOAuthFeedback)
    * [new OAuthFeedback()](#new_OAuthFeedback_new)
    * _instance_
        * [.db](#OAuthFeedback+db)
        * [.oauth](#VolatileOAuthFeedback+oauth) ⇒ <code>boolean</code>
        * [.constraints](#VolatileOAuthFeedback+constraints) : <code>object</code>
    * _static_
        * [.retrieve(account, npaper)](#OAuthFeedback.retrieve) ⇒ [<code>Promise.&lt;OAuthFeedback&gt;</code>](#OAuthFeedback)

<a name="new_OAuthFeedback_new"></a>

### new OAuthFeedback()
Create a new persistent article

<a name="OAuthFeedback+db"></a>

### oAuthFeedback.db
Database configuration for perseest

**Kind**: instance property of [<code>OAuthFeedback</code>](#OAuthFeedback)  
<a name="VolatileOAuthFeedback+oauth"></a>

### oAuthFeedback.oauth ⇒ <code>boolean</code>
Does the feedback belong to an oauth user? (always true)

**Kind**: instance property of [<code>OAuthFeedback</code>](#OAuthFeedback)  
**Overrides**: [<code>oauth</code>](#VolatileOAuthFeedback+oauth)  
<a name="VolatileOAuthFeedback+constraints"></a>

### oAuthFeedback.constraints : <code>object</code>
Constraints on OAuthFeedback instance properties

**Kind**: instance constant of [<code>OAuthFeedback</code>](#OAuthFeedback)  
**Overrides**: [<code>constraints</code>](#VolatileOAuthFeedback+constraints)  
<a name="OAuthFeedback.retrieve"></a>

### OAuthFeedback.retrieve(account, npaper) ⇒ [<code>Promise.&lt;OAuthFeedback&gt;</code>](#OAuthFeedback)
Retrieve a feedback by user/newspaper tuple

**Kind**: static method of [<code>OAuthFeedback</code>](#OAuthFeedback)  
**Returns**: [<code>Promise.&lt;OAuthFeedback&gt;</code>](#OAuthFeedback) - The requested feedback, with a score of 0 if
  it does not exist  

| Param | Type | Description |
| --- | --- | --- |
| account | <code>number</code> | User ID |
| npaper | <code>number</code> | Newspaper ID |

<a name="VolatileOAuthUser"></a>

## VolatileOAuthUser
OAuth user entity, with no support for persistence

**Kind**: global class  

* [VolatileOAuthUser](#VolatileOAuthUser)
    * [new VolatileOAuthUser(opt)](#new_VolatileOAuthUser_new)
    * [.oauth](#VolatileOAuthUser+oauth) ⇒ <code>boolean</code>
    * [.constraints](#VolatileOAuthUser+constraints) : <code>object</code>
    * [.toString()](#VolatileOAuthUser+toString)
    * [.export()](#VolatileOAuthUser+export) ⇒ <code>object</code>

<a name="new_VolatileOAuthUser_new"></a>

### new VolatileOAuthUser(opt)
Instantiate a new OAuthUser


| Param | Type | Description |
| --- | --- | --- |
| opt | <code>object</code> | Constructor parameters |
| opt.id | <code>number</code> | User univocal ID, given by Google |
| opt.name | <code>string</code> | User name, given by Google |
| opt.created | <code>Date</code> | User creation timestamp |
| opt.countries | <code>Array.&lt;String&gt;</code> | Countries in the user preferences |
| opt.topics | <code>Array.&lt;String&gt;</code> | Countries in the user preferences |

<a name="VolatileOAuthUser+oauth"></a>

### volatileOAuthUser.oauth ⇒ <code>boolean</code>
Is the user a OAuth user? (always returns true)

**Kind**: instance property of [<code>VolatileOAuthUser</code>](#VolatileOAuthUser)  
<a name="VolatileOAuthUser+constraints"></a>

### volatileOAuthUser.constraints : <code>object</code>
Constraints on OAuthUser instance properties

**Kind**: instance constant of [<code>VolatileOAuthUser</code>](#VolatileOAuthUser)  
<a name="VolatileOAuthUser+toString"></a>

### volatileOAuthUser.toString()
Return a string representation of the user

**Kind**: instance method of [<code>VolatileOAuthUser</code>](#VolatileOAuthUser)  
<a name="VolatileOAuthUser+export"></a>

### volatileOAuthUser.export() ⇒ <code>object</code>
**Kind**: instance method of [<code>VolatileOAuthUser</code>](#VolatileOAuthUser)  
**Returns**: <code>object</code> - A sharing-safe representation of this user  
<a name="OAuthUser"></a>

## OAuthUser ⇐ [<code>VolatileOAuthUser</code>](#VolatileOAuthUser)
OAuthUser with persistence capability via the perseest package

**Kind**: global class  
**Extends**: [<code>VolatileOAuthUser</code>](#VolatileOAuthUser)  

* [OAuthUser](#OAuthUser) ⇐ [<code>VolatileOAuthUser</code>](#VolatileOAuthUser)
    * [new OAuthUser()](#new_OAuthUser_new)
    * [.db](#OAuthUser+db)
    * [.oauth](#VolatileOAuthUser+oauth) ⇒ <code>boolean</code>
    * [.constraints](#VolatileOAuthUser+constraints) : <code>object</code>
    * [.toString()](#VolatileOAuthUser+toString)
    * [.export()](#VolatileOAuthUser+export) ⇒ <code>object</code>

<a name="new_OAuthUser_new"></a>

### new OAuthUser()
Create a new persistent user

<a name="OAuthUser+db"></a>

### oAuthUser.db
Database configuration for perseest

**Kind**: instance property of [<code>OAuthUser</code>](#OAuthUser)  
<a name="VolatileOAuthUser+oauth"></a>

### oAuthUser.oauth ⇒ <code>boolean</code>
Is the user a OAuth user? (always returns true)

**Kind**: instance property of [<code>OAuthUser</code>](#OAuthUser)  
**Overrides**: [<code>oauth</code>](#VolatileOAuthUser+oauth)  
<a name="VolatileOAuthUser+constraints"></a>

### oAuthUser.constraints : <code>object</code>
Constraints on OAuthUser instance properties

**Kind**: instance constant of [<code>OAuthUser</code>](#OAuthUser)  
**Overrides**: [<code>constraints</code>](#VolatileOAuthUser+constraints)  
<a name="VolatileOAuthUser+toString"></a>

### oAuthUser.toString()
Return a string representation of the user

**Kind**: instance method of [<code>OAuthUser</code>](#OAuthUser)  
**Overrides**: [<code>toString</code>](#VolatileOAuthUser+toString)  
<a name="VolatileOAuthUser+export"></a>

### oAuthUser.export() ⇒ <code>object</code>
**Kind**: instance method of [<code>OAuthUser</code>](#OAuthUser)  
**Overrides**: [<code>export</code>](#VolatileOAuthUser+export)  
**Returns**: <code>object</code> - A sharing-safe representation of this user  
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
    * [new User()](#new_User_new)
    * [.db](#User+db)
    * [.constraints](#VolatileUser+constraints) : <code>object</code>
    * [.BCRYPT_SALT_ROUNDS](#VolatileUser+BCRYPT_SALT_ROUNDS) : <code>number</code>
    * [.toString()](#VolatileUser+toString)
    * [.export()](#VolatileUser+export) ⇒ <code>object</code>
    * [.setPassword(pass)](#VolatileUser+setPassword) ⇒ <code>undefined</code>
    * [.authenticate(pass)](#VolatileUser+authenticate) ⇒ <code>Promise.&lt;boolean&gt;</code>

<a name="new_User_new"></a>

### new User()
Create a new persistent user

<a name="User+db"></a>

### user.db
Database configuration for perseest

**Kind**: instance property of [<code>User</code>](#User)  
<a name="VolatileUser+constraints"></a>

### user.constraints : <code>object</code>
Constraints on User instance properties

**Kind**: instance constant of [<code>User</code>](#User)  
**Overrides**: [<code>constraints</code>](#VolatileUser+constraints)  
<a name="VolatileUser+BCRYPT_SALT_ROUNDS"></a>

### user.BCRYPT\_SALT\_ROUNDS : <code>number</code>
BCrypt hash cost

**Kind**: instance constant of [<code>User</code>](#User)  
**Overrides**: [<code>BCRYPT\_SALT\_ROUNDS</code>](#VolatileUser+BCRYPT_SALT_ROUNDS)  
<a name="VolatileUser+toString"></a>

### user.toString()
Return a string representation of the user

**Kind**: instance method of [<code>User</code>](#User)  
**Overrides**: [<code>toString</code>](#VolatileUser+toString)  
<a name="VolatileUser+export"></a>

### user.export() ⇒ <code>object</code>
**Kind**: instance method of [<code>User</code>](#User)  
**Overrides**: [<code>export</code>](#VolatileUser+export)  
**Returns**: <code>object</code> - A sharing-safe representation of this user  
<a name="VolatileUser+setPassword"></a>

### user.setPassword(pass) ⇒ <code>undefined</code>
Set user password

**Kind**: instance method of [<code>User</code>](#User)  
**Overrides**: [<code>setPassword</code>](#VolatileUser+setPassword)  
**Throws**:

- Password must be valid


| Param | Type | Description |
| --- | --- | --- |
| pass | <code>string</code> | Plaintext password |

<a name="VolatileUser+authenticate"></a>

### user.authenticate(pass) ⇒ <code>Promise.&lt;boolean&gt;</code>
Authenticate a user with a password

**Kind**: instance method of [<code>User</code>](#User)  
**Overrides**: [<code>authenticate</code>](#VolatileUser+authenticate)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - true if given password matches, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| pass | <code>string</code> | User password |


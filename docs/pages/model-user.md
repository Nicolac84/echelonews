---
title: User model documentation
permalink: '/models/user'
---

# User model

## Classes

<dl>
<dt><a href="#VolatileUser">VolatileUser</a></dt>
<dd><p>User entity, with no support for persistence</p>
</dd>
<dt><a href="#User">User</a> ⇐ <code><a href="#VolatileUser">VolatileUser</a></code></dt>
<dd><p>User with persistence capability via the perseest package</p>
</dd>
</dl>

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
        * [.setPassword(pass)](#VolatileUser+setPassword) ⇒
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

### volatileUser.setPassword(pass) ⇒
Set user password

**Kind**: instance method of [<code>VolatileUser</code>](#VolatileUser)  
**Returns**: undefined  
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
    * [.setPassword(pass)](#VolatileUser+setPassword) ⇒
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

### user.setPassword(pass) ⇒
Set user password

**Kind**: instance method of [<code>User</code>](#User)  
**Returns**: undefined  
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


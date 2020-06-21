# validable

_validable_ is a small library which allows to make any class validable with
handy instance/static functions. It is built on top of
[validate.js](https://validatejs.org/), which is required as a dependency.

## Installation

To install validable, you can use npm:

```
npm install validable
```

## Testing

[mocha](https://mochajs.org/) is used as the main test framework, while
[expect.js](https://github.com/Automattic/expect.js) is used as the assertion
library. To test, run `npm test`.

## Usage

validable exposes a _class_ and a _mixin_ to make you augment your classes.
You can refer to validate.js to know about the constraints that can be defined;
moreover, the methods defined by validable emulate the behaviour of the ones
offered by validate.js

Below, a few examples are given:
```js
const Validable = require('validable')

// You can directly construct your class from Validable.Class ...
class Model extends Validable.Class {
  constructor({ field1='abc', field2=123, field3=null } = {}) {
    super()
    this.field1 = field1
    this.field2 = field2
    this.field3 = field3
  }

  // Define a static property called "constraints"
  static constraints = {
    field1: { type: 'string' },
    field2: { type: 'integer' },
    field3: { required: { allowEmpty: false } }
  }
}

// ... Or you can use the mixin
class ValidableModel extends Validable.Mixin(ExistingModel) {
  static constraints = { ... }
}


// Now you can validate your class ...

// ... by instance ...
const mod = new Model({ ... })
validationErrors = mod.validate()  // undefined if no errors

// ... by [field,value] tuple ...
Model.validate('field1', 'someValue')  // undefined if no errors

// ... by similar object
const obj = { field1: 'abc', ... }
Model.validateObject(obj)  // undefined if no errors
```


## License

MIT License

Copyright (c) 2020 Paolo Lucchesi

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

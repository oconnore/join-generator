# Join-Generator for Node.js

[![Build Status](https://secure.travis-ci.org/oconnore/join-generator.png?branch=master)](http://travis-ci.org/oconnore/join-generator)

## What is this?

Join Generator provides a simple API for joining multiple threads of control, and supports callback and promises style.

--------

A ```Generator``` is created like so:

```javascript
var Generator = require('join-generator').Generator;

var gen = new Generator(function(err) {
  // executed when all threads have finished, or when
  // an error has been triggered.
  console.log('all done');
});
```
The passed function is the triggered action when all gates are released. It accepts an error argument. If any of the gates are passed an error (or any truthy argument), the triggered function will be called immediately. 

The Generator object has two methods: ```gate``` and ```release```.

- ```.gate ([error])```
   - Returns a callback accepting an optional error argument. When the last issued callback is called, the generator calls its triggered function.

- ```.release ([error])```
   - Manually releases the triggered function. All active gates are ignored.

To continue the example:

```javascript
var a = gen.gate();
var b = gen.gate();
var c = gen.gate();

setTimeout(function() {
  a();
}, 500);

setTimeout(function() {
  b();
}, 700);

setTimeout(function() {
  c();
}, 1200);

// 'all done' will be printed after 1200 milliseconds.

```

--------

```Joiner```'s are like ```Generator```'s, but for Promises. 

A Joiner is created like this:

```
var j = new Joiner({collect: true});
```

The constructor accepts an options object. Valid options are:

- ```collect``` Boolean
   - Whether or not to collect the resolved promise values added to this ```Joiner```.

```Joiner```'s have one method: ```add```.

- ```.add (...promises)```
   - Add some promises to this Joiner. Each promise added will block this Joiner from resolving until **all** promises resolve, or **any** reject.

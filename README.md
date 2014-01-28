# Join-Generator for Node.js

[![Build Status](https://secure.travis-ci.org/oconnore/join-generator.png?branch=master)](http://travis-ci.org/oconnore/join-generator)

## What is this?

Join Generator provides a simple API for joining multiple threads of control. 

A generator is created like so:

```javascript
var generator = require('join-generator');

var g = generator(function(err) {
  // executed when all threads have finished, or when
  // an error has been triggered.
  console.log('all done');
});
```

Generator returns a factory function that creates callbacks. When the last callback is called, or when any of the callbacks (```function(err) { ... }```) are called with a truthy argument, the generator calls it's passed function and all future execution is disabled (calling callbacks multiple times has no effect). 

```javascript
var a = g();
var b = g();
var c = g();

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

var chai = require('chai');
var assert = chai.assert;
var sinon = require('sinon');

var Generator = require('../generator').Generator;

suite('Generator tests', function() {
  var clock;

  test('Create a new Generator', function(done) {
    var g = new Generator(done);
    g.release();
  });

  test('Throw an error in a new Generator', function(done) {
    var called = false;
    var finish = function() {
      assert.ok(called);
      done();
    };
    var g = new Generator(function(err) {
      assert.ok(err); 
      called = true;
      finish();
    });
    var a = g.gate();
    var b = g.gate();
    b(new Error('test'));
  });

  test('Remove duplicates', function() {
    var count = 0;
    var g = new Generator(function(err) {
      count++;
    });
    var a = g.gate();
    a();
    assert.equal(count, 1);
    a();
    assert.equal(count, 1);
  });

  test('Use the new Generator', function(done) {
    this.slow(200);
    var alldone = null, count = 0;
    var finish = function() {
      assert.ok(alldone);
      done();
    }
    var gen = new Generator(function(err) {
      assert.ok(!err);
      alldone = true;
      finish();
    });
    var loop = gen.gate();
    assert.notOk(alldone);
    var dist = 10;
    var startTime = Date.now();
    for (var i = 0; i < 10; i++) {
      (function(i, cb) {
        setTimeout(function() {
          count++;
          cb();
        }, i * dist);
      })(i, gen.gate());
    }
    assert.equal(count, 0);
    var fn = function(i) {
      if (i < 10) {
        assert.equal(count, Math.floor((Date.now() - startTime) / dist) + 1);
        setTimeout(fn.bind(null, i + 1), dist);
      }
    };
    setTimeout(fn.bind(null, 1), 0);
    loop();
  });
});

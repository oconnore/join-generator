var chai = require('chai');
var assert = chai.assert;
var sinon = require('sinon');

var Promise = require('es6-promise').Promise;
var gen = require('../generator');
var Joiner = gen.Joiner;
var Mapper = gen.Mapper;

suite('Promises tests', function() {

  var mkpromise = function(duration, resolve, value) {
    return new Promise(function(res, err) {
      setTimeout(function() {
        if (resolve) {
          res(value);
        } else {
          err(value);
        }
      }, duration);
    });
  }

  suite('Joiner tests', function() {

    test('Create a new Joiner', function(done) {
      var activated = false;
      var prom = mkpromise(25, true, 67).then(function(x) {
        assert.equal(x, 67);
        activated = true;
      });
      var join = new Joiner();
      join.add(prom);
      join.then(function(v) {
        assert.ok(activated);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    test('Unpopulated Joiner resolves', function(done) {
      var join = new Joiner();
      join.then(function() {
        done();
      });
    });

    test('Populated Joiner does not resolve', function(done) {
      var resolved = false;
      var join = new Joiner();
      join.add(new Promise(function() {}));
      join.then(function(value) {
        resolved = true;
      });
      setTimeout(function() {
        assert.ok(!resolved, 'promise should not resolve');
        done();
      }, 5);
    });

    test('Join multiple', function(done) {
      this.slow(200);
      var activated = [];
      var prom1 = mkpromise(15, true, 1).then(function(x) {
        activated.push(x);
      });
      var prom2 = mkpromise(25, true, 2).then(function(x) {
        activated.push(x);
      });
      var prom3 = mkpromise(35, true, 3).then(function(x) {
        activated.push(x);
      });
      var join = new Joiner();
      join.add(prom1);
      join.add(prom2);
      join.add(prom3);
      join.then(function(v) {
        assert.deepEqual(activated.sort(), [1, 2, 3]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

    test('Throw error', function(done) {
      this.slow(200);
      var activated = [];
      var prom1 = mkpromise(15, true, 1).then(function(x) {
        activated.push(x);
      });
      var prom2 = mkpromise(25, true, 2).then(function(x) {
        activated.push(x);
        throw {error: 'in 2'};
      });
      var prom3 = mkpromise(35, true, 3).then(function(x) {
        activated.push(x);
      });
      var join = new Joiner();
      join.add(prom1);
      join.add(prom3, prom2);
      join.then(function(v) {
        done(new Error('Expected error'));
      }).catch(function(err) {
        assert.deepEqual(err, {error: 'in 2'});
        assert.deepEqual(activated, [1, 2]);
        done();
      });
    });

    test('Collect multiple', function(done) {
      this.slow(200);
      var activated = [];
      var prom1 = mkpromise(15, true, 1);
      prom1.then(function(x) {
        activated.push(x);
      });
      var prom2 = mkpromise(25, true, 2);
      prom2.then(function(x) {
        activated.push(x);
      });
      var prom3 = mkpromise(35, true, 3);
      prom3.then(function(x) {
        activated.push(x);
      });
      var map = new Joiner({collect: true});
      map.add(prom1);
      map.add(prom2);
      map.add(prom3);
      map.then(function(v) {
        assert.deepEqual(activated.sort(), [1, 2, 3]);
        assert.deepEqual(v, [1, 2, 3]);
        done();
      }).catch(function(err) {
        done(err);
      });
    });

  });

});

var he = require('harmony-enumerables');
var eWeakMap = he.WeakMap;
var eSet = he.Set;
var eMap = he.Map;
var Promise = require('es6-promise').Promise;

require('setimmediate');

var priv = new eWeakMap();

/* =============================================================
                         Join Generator
============================================================= */

function expire() {
  var p = priv.get(this);
  if (!p.finished && p.gateset.size === 0) {
    this.release();
  }
}

function Generator(done) {
  priv.set(this, {
    finished: false,
    donecb: done,
    gateset: new eSet(),
    expire: setImmediate(expire.bind(this))
  });
}

Generator.prototype = {
  release: function(err) {
    var p = priv.get(this);
    if (p && !p.finished) {
      clearImmediate(p.expire);
      try {
        if (typeof p.donecb === 'function') {
          p.donecb(err);
        }
      } catch (e) {}
      p.finished = true;
    }
  },
  gate: function() {
    var p = priv.get(this);
    var value = {};
    p.gateset.add(value);
    return function hook(err) {
      if (err) {
        this.release(err);
        return;
      }
      p.gateset.delete(value);
      if (p.gateset.size === 0) {
        this.release();
      }
    }.bind(this);
  }
};

/* =============================================================
                         Promises Joiner
============================================================= */

function resolver(resolve, reject) {
  var p = priv.get(this);
  p.resolve = resolve;
  p.reject = reject;
}

function mapHelper(generator, index, resolved, value) {
  if (resolved) {
    var p = priv.get(this);
    // collect the value
    p.collected[index] = value;
    generator();
  } else {
    // value is an error
    generator(value);
  }
}

// Constructor for a promise that is resolved when all
// dependent promises are resolved. If any dependent promises
// reject, Joiner rejects immediately.
function Joiner(opts) {
  opts = opts || {};
  priv.set(this, {
    collect: !!opts.collect,
    index: 0,
    collected: opts.collect ? [] : undefined,
    generator: new Generator(function(err) {
      var p = priv.get(this);
      if (!err) {
        p.resolve(p.collected);
      } else {
        p.reject(err);
      }
    }.bind(this))
  });
  Promise.call(this, resolver.bind(this));
}

Joiner.prototype = Object.create(Promise.prototype);

Joiner.prototype.add = function(promise) {
  if (arguments.length > 1) {
    for (var i = 0; i < arguments.length; i++) {
      this.add(arguments[i]);
    }
    return;
  }
  var p= priv.get(this);
  var g = p.generator.gate();
  if (p.collect) {
    p.collected.push(undefined);
    var tmp = mapHelper.bind(this, g, p.index++);
    promise.then(tmp.bind(null, true), tmp.bind(null, false));
  } else {
    promise.then(g.bind(null, null), g);
  }
};

exports.Generator = Generator;
exports.Joiner = Joiner;

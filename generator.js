var eSet = require('harmony-enumerables').Set;

module.exports = function(callback) {
  var done = false;
  var s = new eSet();
  var release = function(err) {
    if (!done) {
      try {
        if (typeof callback === 'function') {
          callback(err);
        }
      } catch (e) {}
      done = true;
    }
  };
  var makeHook = function makeHook() {
    var value = {};
    s.add(value);
    return function hook(err) {
      if (err) {
        release(err);
        return;
      }
      s.delete(value);
      if (s.size === 0) {
        release();
      }
    };
  };
  return makeHook;
};


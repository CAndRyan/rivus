'use strict';

module.exports = {
  prefix: function prefix(obj, pref) {
    var out = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        out[pref + key] = obj[key];
      }
    }
    return out;
  }
};

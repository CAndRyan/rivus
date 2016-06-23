'use strict';

(function initialize() {
  var DEFAULT_POST_COUNT = 20;

  var Config = require('./services/config');
  var Feed = require('./services/feed');

  function Rivus(config) {
    this._config = new Config(config);
    this._feed = new Feed(this._config);
  }

  Rivus.prototype.getFeed = function getFeed(postCount, callback) {
    var params = {
      postCount: postCount,
      callback: callback
    };

    if (typeof (postCount) === 'function') {
      params.callback = postCount;
      params.postCount = DEFAULT_POST_COUNT;
    }

    if (typeof (params.callback) !== 'function') {
      return this._feed.get(params.postCount);
    }

    return this._feed.get(params.postCount)
      .then(params.callback.bind(null, null), params.callback.bind(null));
  };

  module.exports = Rivus;
})();

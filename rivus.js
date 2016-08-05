'use strict';

(function initialize() {
  var DEFAULT_POST_COUNT = 20;

  var Config = require('./services/config');
  var Feed = require('./services/feed');

  function Rivus(config) {
    this._config = new Config(config);
    this._feed = new Feed(this._config);
    this._dataStorePromise = createDataStore(this._config);
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

    var promise = loadFeed(this, postCount);

    if (typeof (params.callback) === 'function') {
      promise.then(params.callback.bind(null, null), params.callback.bind(null));
    }

    return promise;
  };

  Rivus.prototype.synchronize = function synchronizeRivus() {
    var feed = this._feed;

    return this._dataStorePromise.then(function(dataStore) {
      if (dataStore) {
        return dataStore.synchronizeFeed(feed);
      } else {
        return null;
      }
    })
  };

  function loadFeed(rivus, postCount) {
    return rivus._dataStorePromise.then(function(dataStore) {
      if (!dataStore) {
        return rivus._feed.get(postCount);
      }
      return dataStore.getFeedPosts(rivus._feed, postCount);
    });
  }

  function createDataStore(configContainer) {
    return configContainer.get().then(function(config) {
      switch (config.dataStore.type) {
        case 'redis':
          return new (require('./services/datastore.redis'))(config);
        default:
          return null;
      }
    });
  }

  module.exports = Rivus;
})();

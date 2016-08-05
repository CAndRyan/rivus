'use strict';

var Promise = require('es6-promise').Promise;
var Merge = require('./merge');
var Provider = require('./provider');
var Cache = require('./cache');

function Feed(config) {
  this._cache = new Cache(config);
  this._providers = createProviders(config);
}

Feed.prototype.get = function getFeed(count) {
  var self = this;
  return this._providers.then(function withProviders(providers) {
    var getPromises = providers.map(getCache.bind(self, count));
    return Promise.all(getPromises).then(Merge);
  });
};

Feed.prototype.getProviders = function getProviders() {
  return this._providers;
};

Feed.prototype.getFeedId = function getFeedId() {
  return this.getProviders()
    .then(function providersToFeedId(providers) {
      return providers.slice().sort(function compareProviders(p1, p2) {
        var f1 = p1.feedId;
        var f2 = p2.feedId;

        if (f1 < f2) {
          return -1;
        } else if (f1 > f2) {
          return 1;
        }
        return 0;
      }).map(function providerToFeedId(provider) {
        return provider.feedId;
      }).join('|');
    });
};

function createProviders(config) {
  return config.get().then(function withConfig(configAttrs) {
    return configAttrs.providers.map(function createProvider(providerConfig) {
      return Provider.create(providerConfig);
    });
  });
}

function getCache(count, provider) {
  var self = this;
  return this._cache.get(provider.id)
    .then(function getCachedResults(cachedResults) {
      return Promise.resolve(cachedResults);
    })
    .catch(function getNewResults() {
      return Promise.resolve(provider.get(count).then(setCache.bind(self, provider.id)));
    });
}

function setCache(providerId, results) {
  this._cache.set(providerId, results);
  return results;
}

module.exports = Feed;

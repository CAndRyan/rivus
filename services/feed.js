'use strict';

var Promise = require('es6-promise').Promise;
var Merge = require('./merge');
var Provider = require('./provider');
var Cache = require('./cache');

function createProviders(config) {
  return config.get().then(function withConfig(configAttrs) {
    return configAttrs.providers.map(function createProvider(providerConfig) {
      return Provider.create(providerConfig);
    });
  });
}

function Feed(config) {
  this._cache = new Cache(config);
  this._providers = createProviders(config);
}

Feed.prototype.get = function getFeed(count) {
  var self = this;
  return this._providers.then(function withProviders(providers) {
    var getPromises = providers.map(getCache.bind(self, count));
    return Promise.all(getPromises).then(Merge.bind(null, providers));
  });
};

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

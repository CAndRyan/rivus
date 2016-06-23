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
  return this._providers.then(function withProviders(providers) {
    var getPromises = providers.map(function getProviderFeed(provider) {
      return provider.get(count);
    });
    return Promise.all(getPromises).then(Merge.bind(null, providers));
  });
};

module.exports = Feed;

'use strict';

var cacheManager = require('cache-manager');
var Promise = require('es6-promise').Promise;


function createCache(config) {
  return config.get().then(function withConfig(configAttrs) {
    var cacheConfig = configAttrs.cache;

    if (Array.isArray(cacheConfig)) {
      return cacheManager.multiCaching(cacheConfig);
    } else if (cacheConfig) {
      return cacheManager.caching(cacheConfig);
    }

    return null;
  });
}


function Cache(config) {
  this._cache = createCache(config);
}


Cache.prototype.get = function getCached(itemKey, missHandler) {
  return this._cache.then(function withCache(cache) {
    if (!cache) {
      return missHandler();
    }

    return new Promise(function tryGetFromCache(resolve, reject) {
      cache.wrap(itemKey, missHandler, function onResult(err, item) {
        if (err) {
          reject(err);
          return;
        }
        resolve(item);
      });
    });
  });
};


module.exports = Cache;

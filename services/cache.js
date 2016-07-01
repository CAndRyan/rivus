'use strict';

var cacheManager = require('cache-manager');
var Promise = require('es6-promise').Promise;
var errors = require('../common/errors');


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

Cache.prototype.get = function getCached(id) {
  return this._cache.then(function getMemoryCache(cache) {
    return new Promise(function tryGetCache(resolve, reject) {
      cache.get(id, function cacheFn(err, result) {
        if (err || !result) {
          reject(err, result);
          if (err) {
            throw new errors.CacheError('Error get cache', id);
          }
        }
        resolve(result);
      });
    });
  });
};

Cache.prototype.set = function setCached(id, result) {
  return this._cache.then(function getMemoryCache(cache) {
    return new Promise(function tryGetCache(resolve, reject) {
      cache.set(id, result, function setMemoryCache(err) {
        if (err) {
          reject(err);
          throw new errors.CacheError('Error set cache', id);
        }
        resolve();
      });
    });
  });
};

module.exports = Cache;

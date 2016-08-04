'use strict';

var Promise = require('es6-promise').Promise;
var fs = require('fs');
var errors = require('../common/errors');
var redisCache = require('cache-manager-redis');

var Provider = require('./provider');

var DEFAULT_CONFIG_PATH = 'rivus.json';

var CACHE_DEFAULTS = {
  memory: {
    store: 'memory',
    ttl: 5,
    max: 25
  },
  redis: {
    store: 'redis',
    host: 'localhost',
    port: 6379,
    auth_pass: '',
    db: 0,
    ttl: 2 * 60 * 60 // 2 hours
  }
};


function cookConfigItem(target, defaults) {
  var configItem = {};

  for (var key in defaults) {
    if (Object.prototype.hasOwnProperty.call(defaults, key)) {
      configItem[key] = target[key] || (target.settings && target.settings[key]) || defaults[key];
    }
  }

  if (configItem.store === 'redis') {
    configItem.store = redisCache;
  }

  return configItem;
}


function cookCacheConfig(rawCacheConfig) {
  function cookCacheItemConfig(rawConfig) {
    var defaults = CACHE_DEFAULTS[rawConfig.store];
    if (defaults) {
      return cookConfigItem(rawConfig, defaults);
    }
    throw new errors.ConfigError('invalid cache configuration for layer ', rawConfig.store);
  }

  if (!rawCacheConfig) {
    return null;
  } else if (Array.isArray(rawCacheConfig)) {
    return rawCacheConfig.map(cookCacheConfig);
  } else if (typeof (rawCacheConfig) === 'object') {
    var config = cookCacheItemConfig(rawCacheConfig);
    if (!config) {
      throw new errors.ConfigError('invalid cache configuration');
    }
    return config;
  }

  throw new errors.ConfigError('invalid cache configuration');
}

function cookEnv(rawConfig) {
  for (var key in rawConfig) {
    if (rawConfig.hasOwnProperty(key)) {
      if (typeof rawConfig[key] === 'string' && rawConfig[key].indexOf('process.env') === 0) {
        try {
          rawConfig[key] = getEnvVar(rawConfig[key]);
        } catch (e) {
          throw new errors.ConfigError('error reading environment variable: ' + rawConfig[key]);
        }
      }
    }
  }

  function getEnvVar(envStr) {
    return envStr.split('.').reduce(reduceEnv, global);
  }

  function reduceEnv(globalObj, k) {
    return globalObj[k];
  }

  return rawConfig;
}

function cookProvidersConfig(rawProvidersConfig) {
  function cookProviderItemConfig(rawConfig) {
    if (typeof (rawConfig.name) === 'string') {
      var error = Provider.verifyConfig(rawConfig);
      if (error) {
        throw new errors.ConfigError(error.message);
      }
      return cookEnv(rawConfig);
    }

    throw new errors.ConfigError('invalid providers configuration: missing provider name');
  }

  if (Array.isArray(rawProvidersConfig)) {
    return rawProvidersConfig.map(cookProviderItemConfig);
  }

  throw new errors.ConfigError('invalid providers configuration');
}

function cookRedisDataStoreConfig(rawConfig) {
  if (typeof rawConfig.path === 'string') {
    return {type: 'redis', path: rawConfig.socket};
  } else if (typeof rawConfig.url === 'string') {
    return {type: 'redis', url: rawConfig.socket};
  }

  var params = {type: 'redis'};

  if (typeof rawConfig.host === 'string') {
    params.host = rawConfig.host;
  }

  if (!!Number(rawConfig.port)) {
    params.port = Number(rawConfig.port);
  }

  if (rawConfig.password) {
    params.password = String(rawConfig.password);
  }

  return params;
}

function cookDataStoreConfig(rawDataStoreConfig) {
  if (rawDataStoreConfig && rawDataStoreConfig.redis) {
    return cookRedisDataStoreConfig(rawDataStoreConfig.redis);
  }
  return {type: null};
}


function cookConfig(rawConfig) {
  return {
    providers: cookProvidersConfig(rawConfig.providers),
    dataStore: cookDataStoreConfig(rawConfig.store),
    cache: cookCacheConfig(rawConfig.cache)
  };
}


function parseJsonFromFile(path, json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    throw new errors.ConfigError('error reading config file "' + path + '": is not valid JSON');
  }
}


function readFile(path) {
  return new Promise(function executor(resolve, reject) {
    fs.readFile(path, 'utf8', function readFileCallback(err, data) {
      if (err) {
        reject(new errors.ConfigError('error reading config file "' + path + '": ' + err.message));
        return;
      }
      resolve(data);
    });
  });
}


function Config(param) {
  function loadConfigFromFile(path) {
    return readFile(path)
      .then(parseJsonFromFile.bind(null, path))
      .then(cookConfig);
  }

  if (param && typeof (param) === 'string') {
    this._source = 'file:' + param;
    this._dataPromise = loadConfigFromFile(param);
  } else if (param && typeof (param) === 'object') {
    this._source = 'object';
    this._dataPromise = Promise.resolve(cookConfig(param));
  } else {
    this._source = 'file:' + DEFAULT_CONFIG_PATH;
    this._dataPromise = loadConfigFromFile(DEFAULT_CONFIG_PATH);
  }
}


Config.prototype.get = function getConfig(callback) {
  if (typeof (callback) === 'function') {
    return this._dataPromise.then(callback.bind(null, null), callback.bind(null));
  }
  return this._dataPromise;
};


module.exports = Config;

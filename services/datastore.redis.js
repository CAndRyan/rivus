'use strict';

var Promise = require('es6-promise');
var redis = require('redis');
var moment = require('moment');

var log = require('../common/log');


function RedisDataStore(config) {
  this.client = createRedisClient(config);
}

RedisDataStore.prototype.synchronizeProvider = function synchronizeProvider(provider, updater) {
  var client = this.client;
  var anchorKey = providerAnchorKey(provider);

  return watchLastPostDate(client, anchorKey)
    .then(getLastPostDate.bind(null, client, anchorKey))
    .then(runUpdater.bind(null, client, updater, anchorKey));
};

RedisDataStore.prototype.synchronizeFeed = function synchronizeFeed(feed, updater) {
  var client = this.client;
  var anchorKey = feedAnchorKey(feed);

  return watchLastPostDate(client, anchorKey)
    .then(getLastPostDate.bind(null, client, anchorKey))
    .then(runUpdater.bind(null, client, updater, anchorKey));
};

RedisDataStore.prototype.getProviderPostsInRange = function getProviderPostsInRange(provider, startDate, endDate) {
  return redisQuery(this.client, 'zrangebyscore', dateToRedis(startDate), dateToRedis(endDate))
    .then(loadPostsByIds.bind(null, this.client));
};


function RedisWriteDataStore(client) {
  this.client = client.multi();
}

RedisWriteDataStore.prototype.commit = function commitWriteStore() {
  return redisQuery(this.client, 'exec');
};

RedisWriteDataStore.prototype.discard = function discardWriteStore() {
  return redisQuery(this.client, 'discard');
};

RedisWriteDataStore.prototype.savePosts = function savePosts(posts) {
  var args = [this.client, 'mset'];
  for (var i = 0; i < posts.length; i++) {
    var post = posts[i];
    args.push(postKey(post), JSON.stringify(post));
  }
  redisOneOffQuery.apply(null, args);
};

RedisWriteDataStore.prototype.addPostsToFeed = function addPostsToFeed(feed, posts) {
  var args = [this.client, 'zadd', feedPostsKey(feed)];
  for (var i = 0; i < posts.length; i++) {
    var post = posts[i];
    args.push(dateToRedis(post.created_at), post.id);
  }
  redisOneOffQuery.apply(null, args);
};

RedisWriteDataStore.prototype.addPostsToProvider = function addPostsToProvider(provider, posts) {
  var args = [this.client, 'zadd', providerPostsKey(provider)];
  for (var i = 0; i < posts.length; i++) {
    var post = posts[i];
    args.push(dateToRedis(post.created_at), post.id);
  }
  redisOneOffQuery.apply(null, args);
};


function runUpdater(client, updater, lastSavedPostDate, lastPostDateKey) {
  var writeStore = new RedisWriteDataStore(client);

  return updater(lastSavedPostDate, writeStore)
    .then(
      function onUpdaterComplete(lastPostDate) {
        saveLastPostDate(writeStore.client, lastPostDateKey, lastPostDate);
        return writeStore.commit();
      },
      function onUpdaterFailed(error) {
        writeStore.discard();
        throw error;
      }
    );
}

function watchLastPostDate(client, anchorKey) {
  return redisQuery(client, 'watch', anchorKey);
}

function getLastPostDate(client, key) {
  return redisQuery(client, 'get', key)
    .then(function parseDate(result) {
      var value = JSON.parse(result);
      if (Array.isArray(value)) {
        return value.map(dateFromRedis);
      }
      return dateFromRedis(value);
    });
}

function saveLastPostDate(client, key, value) {
  var redisValue;
  if (Array.isArray(value)) {
    redisValue = JSON.stringify(value.map(dateToRedis));
  } else {
    redisValue = value.toString();
  }
  redisOneOffQuery(client, 'set', key, redisValue);
}

function createRedisClient(config) {
  var params = {};
  if (config.path) {
    params.path = config.path;
  } else {
    params.host = config.host || '127.0.0.1';
    params.port = config.port || 6379;
  }

  var client = redis.createClient(params);

  client.on('error', function onError(e) {
    log.error('Redis store: ', e);
  });

  client.on('warning', function onWarning(w) {
    log.warn('Redis store: warning: ', w);
  });

  client.on('reconnecting', function onReconnecting() {
    log.warn('Redis store: reconnecting to server...');
  });

  client.on('connect', function onConnect() {
    log.info('Redis store: connected to server');
  });

  return client;
}

function loadPostsByIds(client, postIds) {
  var args = [client, 'mget'].concat(postIds);
  return redisQuery.apply(null, args).then(function postsFromJson(postsJson) {
    return postsJson.map(function postFromJson(postJson) {
      return JSON.parse(postJson);
    });
  });
}

function providerAnchorKey(provider) {
  return 'rivus:anchor:provider:' + provider.feedId;
}

function feedAnchorKey(feed) {
  return 'rivus:anchor:feed:' + feed.feedId;
}

function providerPostsKey(provider) {
  return 'rivus:provider:' + provider.feedId;
}

function feedPostsKey(feed) {
  return 'rivus:feed:' + feed.feedId;
}

function postKey(post) {
  return 'rivus:post:' + post.id;
}

function redisQuery(client, command) {
  return new Promise(function runAsyncQuery(resolve, reject) {
    var args = [command];
    for (var i = 2; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    log.debug.apply(log, ['Redis:'].concat(args));

    args.push(function processRedisResponse(err, response) {
      if (err) {
        log.error('Redis error:', command, err);
        return reject(err);
      }
      return resolve(response);
    });

    client[command].apply(client, args);
  });
}

function redisOneOffQuery(client, command) {
  var args = [command];
  for (var i = 2; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  client[command].apply(client, args);
}

function dateToRedis(date) {
  return date ? date.valueOf() : null;
}

function dateFromRedis(redisDate) {
  return redisDate ? moment(Number(redisDate)) : null;
}

module.exports = RedisDataStore;

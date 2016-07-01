"use strict";

var expect = require('chai').expect;
var Promise = require('es6-promise').Promise;

describe('services.cache', function() {
  var Config = require('../services/config');
  var config = new Config({
    "cache": {
      "store": "memory"
    },
    "providers": [
      {
        "name": "rss",
        "feed_url": "https://nodejs.org/en/feed/blog.xml"
      }
    ]
  });

  var config_redis = new Config({
    "cache": {
      "store": "redis"
    },
    "providers": [
      {
        "name": "rss",
        "feed_url": "https://nodejs.org/en/feed/blog.xml"
      }
    ]
  });
  
  it('should have a service that is not undefined', function () {
    var Cache = require('../services/cache');
    expect(Cache).to.be.exist;
    var cache = new Cache(config);
    expect(cache).to.be.exist;
    expect(cache.get).to.be.a('function');
  });

  it('get method should return a Promise', function () {
    var Cache = require('../services/cache');
    var cache = new Cache(config);
    expect(cache.get(null, null)).to.be.an.instanceOf(Promise);
  });
  
  it('set method should return a Promise', function () {
    var Cache = require('../services/cache');
    var cache = new Cache(config);
    expect(cache.set(null, null)).to.be.an.instanceOf(Promise);
  });

  it('set method should to cache data', function () {
    var Cache = require('../services/cache');
    var cache = new Cache(config);
    cache.set('foo', 'bar').then(function () {
      cache.get('foo').then(function (results) {
        expect(results).to.equal('bar');
      });
    });
  });
  
  it('set method should to cache data to redis', function () {
    var Cache = require('../services/cache');
    var cache = new Cache(config_redis);
    cache.set('foo', 'bar').then(function () {
      cache.get('foo').then(function (results) {
        expect(results).to.equal('bar');
      });
    });
  });

});
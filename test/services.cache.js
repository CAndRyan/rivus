"use strict";

var expect = require('chai').expect;
var Promise = require('es6-promise').Promise;
var rewire = require('rewire');

describe('services.cache', function() {
  describe('services.cache.single', function() {

    var Config = require('../services/config');
    var configObj = {
      "cache": {
        "store": "memory",
        "ttl": 1,
        "max": 25
      },
      "providers": [
        {
          "name": "rss",
          "feed_url": "https://nodejs.org/en/feed/blog.xml"
        }
      ]
    };
    var config = new Config(configObj);

    var config_redis = new Config({
      "cache": {
        "store": "redis",
        "ttl": 1
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

    it('caching method in the cacheManager should get config', function () {
      var cacheMock = {
        caching: function (cfg) {
          return cfg;
        }
      };
      var Cache = rewire('../services/cache');
      Cache.__set__("cacheManager", cacheMock);
      var cache = new Cache(config);
      return cache._cache.then(function (cfg) {
        expect(cfg).to.be.a('object');
        expect(cfg).to.have.all.keys(configObj.cache);
      });
    });

    it('set method should call set method in cache-manager', function () {
      var cacheMock = {
        caching: function (cfg) {
          return {
            'set': function (key, val, cb) {
              expect(key).to.eql('foo');
              cb(null, key);
            }
          };
        }
      };

      var Cache = rewire('../services/cache');
      Cache.__set__("cacheManager", cacheMock);
      var cache = new Cache(config_redis);
      return cache.set('foo', 'bar');
    });

    it('get method should call get method in cache-manager', function () {
      var cacheMock = {
        caching: function (cfg) {
          return {
            'get': function (key, cb) {
              expect(key).to.eql('foo');
              cb(null, key);
            }
          };
        }
      };

      var Cache = rewire('../services/cache');
      Cache.__set__("cacheManager", cacheMock);
      var cache = new Cache(config);
      return cache.get('foo');
    });


  });

  describe('services.cache.multi', function() {
    var Config = require('../services/config');
    var configObj = {
      "cache": [
        {
          "store": "memory",
          "settings": {
            "ttl": 1
          }
        },
        {
          "store": "redis",
          "ttl": 1
        }
      ],
      "providers": [
        {
          "name": "rss",
          "feed_url": "https://nodejs.org/en/feed/blog.xml"
        }
      ]
    };
    var config = new Config(configObj);

    it('multiCaching method in the cacheManager should get multiple config', function () {
      var cacheMock = {
        multiCaching: function (cfg) {
          return cfg;
        }
      };
      var Cache = rewire('../services/cache');
      Cache.__set__("cacheManager", cacheMock);
      var cache = new Cache(config);
      return cache._cache.then(function (cfg) {
        expect(cfg).to.be.a('array');
        expect(cfg).to.have.lengthOf(2);
      });
    });

  });
});
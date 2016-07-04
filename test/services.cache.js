"use strict";

var expect = require('chai').expect;
var Promise = require('es6-promise').Promise;

describe('services.cache', function() {
  describe('services.cache.single', function() {

    var Config = require('../services/config');
    var config = new Config({
      "cache": {
        "store": "memory",
        "settings": {
          "ttl": 1
        }
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

    it('get should return empty results when an invalid key', function () {
      var Cache = require('../services/cache');
      var cache = new Cache(config);
      cache.get('foo567')
        .catch(function (err, results) {
          expect(err).to.be.a('null');
          expect(results).to.be.a('undefined');
        });
    });

    it('cache should to expire in memory after 1 second', function (done) {
      var Cache = require('../services/cache');
      var cache = new Cache(config);
      return cache.set('baz', 'bar').then(function () {
        return new Promise(function executor(resolve, reject) {
          setTimeout(function () {
            cache.get('baz')
              .catch(function (err, results) {
                expect(err).to.be.a('null');
                expect(results).to.be.a('undefined');
                resolve();
                done();
              });
          }, 1200);
        });

      });
    });

    it('cache should to expire in redis after 1 second', function (done) {
      var Cache = require('../services/cache');
      var cache = new Cache(config_redis);
      return cache.set('baz', 'bar').then(function () {
        return new Promise(function executor(resolve, reject) {
          setTimeout(function () {
            cache.get('baz')
              .catch(function (err, results) {
                expect(err).to.be.a('null');
                expect(results).to.be.a('undefined');
                resolve();
                done();
              });
          }, 1200);
        });
      });
    });
  });

  describe('services.cache.multi', function() {
    var Config = require('../services/config');
    var config = new Config({
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
    });

    it('set method should to cache data', function () {
      var Cache = require('../services/cache');
      var cache = new Cache(config);
      cache.set('alpha', 'bar').then(function () {
        cache.get('alpha').then(function (results) {
          expect(results).to.equal('bar');
        });
      });
    });

    it('get should return empty results when an invalid key', function () {
      var Cache = require('../services/cache');
      var cache = new Cache(config);
      cache.get('foo567')
        .catch(function (err, results) {
          expect(err).to.be.a('null');
          expect(results).to.be.a('undefined');
        });
    });
  });
});
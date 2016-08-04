"use strict";

var expect = require('chai').expect;

describe('services.config', function() {
  it('should have a service that is not undefined', function() {
    var Config = require('../services/config');
    expect(Config).to.be.exist;
    var config = new Config();
    expect(config).to.be.exist;
  });

  it('_source should be an object when config as object', function() {
    var Config = require('../services/config');
    var config = new Config({
      "providers": []
    });
    expect(config._source).to.equal('object');
  });

  it('_source should be an file+path when config as file', function() {
    var Config = require('../services/config');
    var config = new Config(__dirname + '/services_config.json');
    expect(config._source).to.equal('file:' + __dirname + '/services_config.json');
  });

  it('_source should be an file+default_path when config is empty', function() {
    var Config = require('../services/config');
    var config = new Config();
    expect(config._source).to.equal('file:rivus.json');
  });

  it('Config should be parse environment variable', function() {
    var Config = require('../services/config');
    var config = new Config({
      "providers": [
        {name: 'rss', feed_url: 'http://example.org', env: 'process.env.HOME'}
      ]
    });
    expect(config).to.be.ok;
  });

  it('should parse redis data store config', function() {
    var Config = require('../services/config');
    var config = new Config({
      providers: [{
        name: 'facebook',
        app_id: 'app_id',
        app_secret: 'app_secret',
        user_id: 12345
      }],
      store: {
        redis: {
          host: '123.100.14.12',
          port: '3333'
        },
        foo: {
          bar: 'baz'
        }
      }
    });

    return config.get().then(function(configValues) {
      expect(configValues.dataStore).to.eql({
        type: 'redis',
        host: '123.100.14.12',
        port: 3333
      });
    });
  })

});

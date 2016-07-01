"use strict";

var expect = require('chai').expect;

describe('services.provider', function() {
  it('should have a service that is not undefined', function () {
    var Provider = require('../services/provider');
    expect(Provider).to.be.exist;
  });

  it('should have a create method', function () {
    var provider = require('../services/provider');
    expect(provider.create).to.be.exist;
    expect(provider.create).to.be.a('function');
  });

  it('should have a exists method', function () {
    var provider = require('../services/provider');
    expect(provider.exists).to.be.exist;
    expect(provider.exists).to.be.a('function');
  });

  it('should have a verifyConfig method', function () {
    var provider = require('../services/provider');
    expect(provider.verifyConfig).to.be.exist;
    expect(provider.verifyConfig).to.be.a('function');
  });

  it('exists method should return a boolean', function () {
    var provider = require('../services/provider');
    expect(provider.exists('')).to.be.a('boolean');
  });

  it('create method should return a rss object', function () {
    var provider = require('../services/provider');
    var config = {
      "name": "rss",
      "feed_url": "http://example.org"
    };
    var rssObject = provider.create(config);
    expect(rssObject).to.be.a('object');
    expect(rssObject.name).to.equal('rss');
  });

  it('verifyConfig method should return a null', function () {
    var provider = require('../services/provider');
    var config = {
      "name": "rss",
      "feed_url": "http://example.org"
    };
    expect(provider.verifyConfig(config)).to.be.a('null');
  });

  it('verifyConfig method should return not null', function () {
    var provider = require('../services/provider');
    var config = {
      "name": "rss"
    };
    expect(provider.verifyConfig(config)).to.not.be.a('null');
  });
});
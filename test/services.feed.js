"use strict";

var expect = require('chai').expect;
var Promise = require('es6-promise').Promise;

describe('services.feed', function() {
  var Config = require('../services/config');
  var config = new Config({
    "providers": []
  });

  it('should have a service that is not undefined', function () {
    var Feed = require('../services/feed');
    expect(Feed).to.be.exist;
    var feed = new Feed(config);
    expect(feed).to.be.exist;
  });

  it('get method should return a Promise', function () {
    var Feed = require('../services/feed');
    var feed = new Feed(config);
    expect(feed.get(10)).to.be.an.instanceOf(Promise);
  });
});
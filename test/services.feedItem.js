"use strict";

var expect = require('chai').expect;

describe('services.feedItem', function() {
  var COMMON_FORMAT = {
    title: '',
    content: '',
    created_time: '',
    images: {},
    extra: {},
    source: {
      name: '',
      feed: ''
    }
  };

  it('should have a service that is not undefined', function () {
    var feedItem = require('../services/feedItem');
    expect(feedItem).to.be.exist;
    expect(feedItem).to.be.a('function');
  });

  it('should return an object', function () {
    var feedItem = require('../services/feedItem');
    var item = feedItem(COMMON_FORMAT);
    expect(item).to.be.a('object');
    expect(item).to.have.all.keys(COMMON_FORMAT);
  });
});
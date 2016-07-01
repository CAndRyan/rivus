"use strict";

var expect = require('chai').expect;

describe('feedUtils', function() {
  it('should have a feedUtils that is not undefined', function () {
    var feedUtils = require('../common/feedUtils');
    expect(feedUtils).to.be.exist;
  });

  describe('feedUtils.prefix', function() {
    var obj = {
      test: 1,
      test2: 2,
      test3: 3
    };

    it('should have a prefix method that is not undefined', function () {
      var feedUtils = require('../common/feedUtils');
      expect(feedUtils.prefix).to.be.exist;
      expect(feedUtils.prefix).to.be.a('function');
    });

    it('should return an object', function () {
      var feedUtils = require('../common/feedUtils');
      expect(feedUtils.prefix(obj, 'pref-')).to.be.a('object');
    });

    it('should be prefixes in each key', function () {
      var feedUtils = require('../common/feedUtils');
      var results = feedUtils.prefix(obj, 'pref-');
      expect(results).to.have.all.keys(['pref-test', 'pref-test2', 'pref-test3']);
    });
  });
});


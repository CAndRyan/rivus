"use strict";

var expect = require('chai').expect;

describe('services.merge', function () {
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
    var merge = require('../services/merge');
    expect(merge).to.be.exist;
    expect(merge).to.be.a('function');
  });

  it('should return an array', function () {
    var merge = require('../services/merge');
    var feeds = [[COMMON_FORMAT], [COMMON_FORMAT]];
    expect(merge({}, feeds)).to.be.a('array');
  });

  it('response array should be 2 length', function () {
    var merge = require('../services/merge');
    var feeds = [[COMMON_FORMAT], [COMMON_FORMAT]];
    expect(merge({}, feeds)).to.have.lengthOf(2);
  });

});

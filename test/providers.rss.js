'use strict';

var expect = require('chai').expect;
var nock = require('nock');

var HOST = 'http://www.example.org';
var PATH = '/export/1';
var RESPONSE = __dirname + '/replies/rss.rss';
var CONFIG = {
  name: 'rss',
  feed_url: 'http://www.example.org/export/1'
};

describe('providers.rss', function() {
  it('should have a rss provider that is not undefined', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Rss = require('../providers/rss');
    expect(Rss).to.be.exist;
    var rss = new Rss(CONFIG);
    expect(rss).to.be.exist;
  });

  it('get method should return a promise', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Rss = require('../providers/rss');
    var rss = new Rss(CONFIG);
    expect(rss.get(10)).to.be.a('promise');
  });

  it('callback in get method should get an array', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Rss = require('../providers/rss');
    var rss = new Rss(CONFIG);
    return rss.get(11).then(function (response) {
      expect(response).to.be.a('array');
    });
  });

  it('response array should be 11 length', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Rss = require('../providers/rss');
    var rss = new Rss(CONFIG);
    return rss.get(11).then(function (response) {
      expect(response).to.have.lengthOf(11);
    });
  });

  it('RSS item should be an object', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Rss = require('../providers/rss');
    var rss = new Rss(CONFIG);
    return rss.get(11).then(function (response) {
      expect(response[0]).to.be.a('object');
      expect(response[0].images).to.be.a('object');
    });
  });
});


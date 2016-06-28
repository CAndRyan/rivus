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

  it('get method should return a object', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Rss = require('../providers/rss');
    var rss = new Rss(CONFIG);
    expect(rss.get(10)).to.be.a('object');
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

  it('RSS provider should have config validator', function () {
    var Rss = require('../providers/rss');
    expect(Rss.verifyConfig).to.be.exist;
  });

  it('Validator should return a null with valid config', function () {
    var CONFIG = {
      "name": "rss",
      "feed_url": "http://www.ixbt.com/export/articles.rss"
    };

    var Rss = require('../providers/rss');
    expect(Rss.verifyConfig(CONFIG)).to.be.a('null');
  });

  it('Validator should return not a null with invalid config', function () {
    var Rss = require('../providers/rss');
    expect(Rss.verifyConfig({})).to.be.not.a('null');
    expect(Rss.verifyConfig({name: 'rss'})).to.be.not.a('null');
    expect(Rss.verifyConfig({name: 'rss', feed_url: 'test'})).to.be.not.a('null');
  });


});


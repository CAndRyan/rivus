'use strict';

var expect = require('chai').expect;
var nock = require('nock');

var HOST = 'http://www.example.org';
var PATH = '/export/1';
var RESPONSE = __dirname + '/replies/rss.rss';

describe('rivus', function() {
  it('should have a Rivus that is not undefined', function () {
    var Rivus = require('../rivus');
    expect(Rivus).to.be.exist;
  });

  it('should have a getFeed method', function () {
    var Rivus = require('../rivus');
    var r = new Rivus();
    expect(r.getFeed).to.be.exist;
  });

  it('getFeed method should return a promise', function () {
    var Rivus = require('../rivus');
    var r = new Rivus();
    expect(r.getFeed(1)).to.be.a('promise');
  });

  it('then should get an array', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);

    var Rivus = require('../rivus');
    var r = new Rivus({
      providers: [{
        name: "rss",
        feed_url: 'http://www.example.org/export/1'
      }]
    });
    return r.getFeed(2).then(function (response) {
      expect(response).to.be.an('array');
    });
  });

  it('callback should get an array', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);

    var Rivus = require('../rivus');
    var r = new Rivus({
      providers: [{
        name: "rss",
        feed_url: 'http://www.example.org/export/1'
      }]
    });
    return r.getFeed(2, function (err, response) {
      expect(response).to.be.an('array');
      expect(err).to.be.a('null');
    });
  });

  it('callback should get an error', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);

    var Rivus = require('../rivus');
    var r = new Rivus({
      providers: [{
        name: "rss",
        feed_url: 'http://www.example.org/export/2'
      }]
    });
    return r.getFeed(2, function (err, response) {
      expect(err).to.be.an('object');
      expect(response).to.be.an('undefined');
    });
  });

  it('catch should get an error', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);

    var Rivus = require('../rivus');
    var r = new Rivus({
      providers: [{
        name: "rss",
        feed_url: 'http://www.example.org/export/2'
      }]
    });
    return r.getFeed(2).then(function (response) {})
      .catch(function (err) {
        expect(err).to.be.an('object');
      });
  });
});
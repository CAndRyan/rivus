"use strict";

var expect = require('chai').expect;
var nock = require('nock');

var HOST = 'https://medium.com';

describe('providers.medium', function() {
  describe('providers.medium.user', function() {
    var PATH = '/feed/@davepell';
    var RESPONSE = __dirname + '/replies/medium_user.rss';

    var CONFIG = {
      name: 'medium',
      user: '@davepell'
    };

    it('should have a medium provider that is not undefined', function () {
      var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
      var Medium = require('../providers/medium');
      expect(Medium).to.be.exist;
      var md = new Medium(CONFIG);
      expect(md).to.be.exist;
    });

    it('get method should return a object', function () {
      var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
      var Medium = require('../providers/medium');
      var md = new Medium(CONFIG);
      expect(md.get(10)).to.be.a('object');
    });

    it('callback in get method should get an array', function () {
      var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
      var Medium = require('../providers/medium');
      var md = new Medium(CONFIG);
      return md.get(5).then(function (response) {
        expect(response).to.be.a('array');
      });
    });

    it('response array should be 3 length', function () {
      var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
      var Medium = require('../providers/medium');
      var md = new Medium(CONFIG);
      return md.get(3).then(function (response) {
        expect(response).to.have.lengthOf(3);
      });
    });

    it('Medium item should be an object', function () {
      var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
      var Medium = require('../providers/medium');
      var md = new Medium(CONFIG);
      return md.get(3).then(function (response) {
        expect(response[0]).to.be.a('object');
        expect(response[0].images).to.be.a('object');
      });
    });
  });

  describe('providers.medium.publication', function() {
    var PATH = '/feed/the-story';
    var RESPONSE = __dirname + '/replies/medium_publication.rss';

    var CONFIG = {
      name: 'medium',
      publication: 'the-story'
    };


    it('callback in get method should get an array', function () {
      var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
      var Medium = require('../providers/medium');
      var md = new Medium(CONFIG);
      return md.get(5).then(function (response) {
        expect(response).to.be.a('array');
      });
    });

    it('response array should be 3 length', function () {
      var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
      var Medium = require('../providers/medium');
      var md = new Medium(CONFIG);
      return md.get(3).then(function (response) {
        expect(response).to.have.lengthOf(3);
      });
    });

    it('Medium item should be an object', function () {
      var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
      var Medium = require('../providers/medium');
      var md = new Medium(CONFIG);
      return md.get(3).then(function (response) {
        expect(response[0]).to.be.a('object');
        expect(response[0].images).to.be.a('object');
      });
    });
  });


  describe('providers.medium.publication_with_custom_domain', function() {
    var HOST = 'https://theringer.com';
    var PATH = '/feed';
    var RESPONSE = __dirname + '/replies/medium_custom_domain.rss';

    var CONFIG = {
      name: 'medium',
      publication_with_custom_domain: 'https://theringer.com'
    };


    it('callback in get method should get an array', function () {
      var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
      var Medium = require('../providers/medium');
      var md = new Medium(CONFIG);
      return md.get(5).then(function (response) {
        expect(response).to.be.a('array');
      });
    });

    it('response array should be 3 length', function () {
      var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
      var Medium = require('../providers/medium');
      var md = new Medium(CONFIG);
      return md.get(3).then(function (response) {
        expect(response).to.have.lengthOf(3);
      });
    });

    it('Medium item should be an object', function () {
      var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
      var Medium = require('../providers/medium');
      var md = new Medium(CONFIG);
      return md.get(3).then(function (response) {
        expect(response[0]).to.be.a('object');
        expect(response[0].images).to.be.a('object');
      });
    });
  });


  it('Medium provider should have config validator', function () {
    var Medium = require('../providers/medium');
    expect(Medium.verifyConfig).to.be.exist;
  });

  it('Validator should return a null with valid config', function () {
    var CONFIG = {
      "name": "medium",
      "user": "@davepell"
    };

    var Medium = require('../providers/medium');
    expect(Medium.verifyConfig(CONFIG)).to.be.a('null');
  });

  it('Validator should return not a null with invalid config', function () {
    var Medium = require('../providers/medium');
    expect(Medium.verifyConfig({})).to.be.not.a('null');
    expect(Medium.verifyConfig({name: 'medium'})).to.be.not.a('null');
    expect(Medium.verifyConfig({name: 'medium', user: 'test'})).to.be.not.a('null');
    expect(Medium.verifyConfig({name: 'medium', publication_with_custom_domain: 'test'})).to.be.not.a('null');
  });

});


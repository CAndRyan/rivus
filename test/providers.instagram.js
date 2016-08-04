'use strict';

var expect = require('chai').expect;
var nock = require('nock');
var Promise = require('es6-promise').Promise;

var HOST = 'https://api.instagram.com';
var PATH = '/v1/users/self/media/recent/?access_token=_CRDjNF8MEZoC9yq8xqbciPdp7jolx38FnP4i3PNRyQVXe3shtmqg3ZFJSQFCqakbKJCpY_HpG8dEOgSSkeWNBdXax8gA';
var RESPONSE = __dirname + '/replies/instagram.json';

var CONFIG = {
  name: 'instagram',
  user: 'vasily',
  access_token: '_CRDjNF8MEZoC9yq8xqbciPdp7jolx38FnP4i3PNRyQVXe3shtmqg3ZFJSQFCqakbKJCpY_HpG8dEOgSSkeWNBdXax8gA'
};

describe('providers.instagram', function() {
  it('should have a instagram provider that is not undefined', function() {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Instagram = require('../providers/instagram');
    expect(Instagram).to.be.exist;
    var ins = new Instagram(CONFIG);
    expect(ins).to.be.exist;
  });

  it('get method should return a promise', function() {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Instagram = require('../providers/instagram');
    var ins = new Instagram(CONFIG);
    expect(ins.get(5)).to.be.an.instanceOf(Promise);
  });

  it('callback in get method should get an array', function() {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Instagram = require('../providers/instagram');
    var ins = new Instagram(CONFIG);
    return ins.get(5).then(function(response) {
      expect(response).to.be.a('array');
    });
  });

  it('Instagram provider item should be an object', function() {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Instagram = require('../providers/instagram');
    var ins = new Instagram(CONFIG);
    return ins.get(11).then(function(response) {
      expect(response[0]).to.be.a('object');
      expect(response[0].images).to.be.a('object');
    });
  });

  it('Instagram provider should have config validator', function() {
    var Instagram = require('../providers/instagram');
    expect(Instagram.verifyConfig).to.be.exist;
  });

  it('Validator should return a null with valid config', function() {
    var CONFIG = {
      name: 'instagram',
      user: '@test',
      access_token: '_CRDjNF8MEZoC9yq8xqbciPdp7jolx38FnP4i3PNRyQVXe3shtmqg3ZFJSQFCqakbKJCpY_HpG8dEOgSSkeWNBdXax8gA'
    };

    var Instagram = require('../providers/instagram');
    expect(Instagram.verifyConfig(CONFIG)).to.be.a('null');
  });

  it('Validator should return not a null with invalid config', function() {
    var Instagram = require('../providers/instagram');
    expect(Instagram.verifyConfig({})).to.be.not.a('null');
    expect(Instagram.verifyConfig({ name: 'instagram' })).to.be.not.a('null');
    expect(Instagram.verifyConfig({ name: 'instagram', user: 'test' })).to.be.not.a('null');
    expect(Instagram.verifyConfig({ name: 'instagram', user: '@test' })).to.be.not.a('null');
    expect(Instagram.verifyConfig({ name: 'instagram', access_token: '1' })).to.be.not.a('null');
    expect(Instagram.verifyConfig({ name: 'instagram', access_token: '1', user: 'test' })).to.be.not.a('null');
  });

  it('should have a proper feed id', function() {
    var inst = new (require('../providers/instagram'))(CONFIG);
    expect(inst.feedId).to.eql('instagram:vasily');
  });
});


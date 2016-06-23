'use strict';

var expect = require('chai').expect;
var nock = require('nock');

var HOST = 'https://api.instagram.com';
var PATH = '/v1/users/self/media/recent/?access_token=_CRDjNF8MEZoC9yq8xqbciPdp7jolx38FnP4i3PNRyQVXe3shtmqg3ZFJSQFCqakbKJCpY_HpG8dEOgSSkeWNBdXax8gA';
var RESPONSE = __dirname + '/replies/instagram.json';

var CONFIG = {
  name: 'instagram',
  access_token: '_CRDjNF8MEZoC9yq8xqbciPdp7jolx38FnP4i3PNRyQVXe3shtmqg3ZFJSQFCqakbKJCpY_HpG8dEOgSSkeWNBdXax8gA'
};

describe('providers.instagram', function() {
  it('should have a instagram provider that is not undefined', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Instagram = require('../providers/instagram');
    expect(Instagram).to.be.exist;
    var ins = new Instagram(CONFIG);
    expect(ins).to.be.exist;
  });

  it('get method should return a promise', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Instagram = require('../providers/instagram');
    var ins = new Instagram(CONFIG);
    expect(ins.get(5)).to.be.a('promise');
  });

  it('callback in get method should get an array', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Instagram = require('../providers/instagram');
    var ins = new Instagram(CONFIG);
    return ins.get(5).then(function (response) {
      expect(response).to.be.a('array');
    });
  });

  it('response array should be 3 length', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Instagram = require('../providers/instagram');
    var ins = new Instagram(CONFIG);
    return ins.get(3).then(function (response) {
      expect(response).to.have.lengthOf(3);
    });
  });

  it('Instagram item should be an object', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Instagram = require('../providers/instagram');
    var ins = new Instagram(CONFIG);
    return ins.get(11).then(function (response) {
      expect(response[0]).to.be.a('object');
      expect(response[0].images).to.be.a('object');
    });
  });

});


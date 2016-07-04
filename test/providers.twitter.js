'use strict';

var expect = require('chai').expect;
var nock = require('nock');
var Promise = require('es6-promise').Promise;

var HOST = 'https://api.twitter.com';
var PATH = '/1.1/statuses/user_timeline.json?screen_name=user&count=2';
var RESPONSE = __dirname + '/replies/twitter.json';

var CONFIG = {
  name: 'twitter',
  user: 'user',
  consumer_key: 'dadadad',
  consumer_secret: '432432424',
  access_token_key: 'rewrwerwerwe',
  access_token_secret: '3123131'
};

describe('providers.twitter', function() {
  it('should have a Twitter provider that is not undefined', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Twitter = require('../providers/twitter');
    expect(Twitter).to.be.exist;
    var tw = new Twitter(CONFIG);
    expect(tw).to.be.exist;
  });

  it('get method should return a promise', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Twitter = require('../providers/twitter');
    var tw = new Twitter(CONFIG);
    expect(tw.get(2)).to.be.an.instanceOf(Promise);
  });

  it('callback in get method should get an array', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Twitter = require('../providers/twitter');
    var tw = new Twitter(CONFIG);
    return tw.get(2).then(function (response) {
      expect(response).to.be.a('array');
    });
  });

  it('response array should be 3 length', function () {
    var PATH = '/1.1/statuses/user_timeline.json?screen_name=user&count=1';
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Twitter = require('../providers/twitter');
    var tw = new Twitter(CONFIG);
    return tw.get(1).then(function (response) {
      expect(response).to.have.lengthOf(1);
    });
  });

  it('Twitter item should be an object', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Twitter = require('../providers/twitter');
    var tw = new Twitter(CONFIG);
    return tw.get(2).then(function (response) {
      expect(response[0]).to.be.a('object');
      expect(response[0].images).to.be.a('object');
    });
  });

  it('Twitter provider should have config validator', function () {
    var Twitter = require('../providers/twitter');
    expect(Twitter.verifyConfig).to.be.exist;
  });

  it('Validator should return a null with valid config', function () {
    var CONFIG = {
      "name": "twitter",
      "user": "@test",
      "consumer_key": "foo",
      "consumer_secret": "bar",
      "access_token_key": "baz",
      "access_token_secret": "foo"
    };

    var Twitter = require('../providers/twitter');
    expect(Twitter.verifyConfig(CONFIG)).to.be.a('null');
  });

  it('Validator should return not a null with invalid' +
    ' config', function () {
    var Twitter = require('../providers/twitter');
    expect(Twitter.verifyConfig({})).to.be.not.a('null');
    expect(Twitter.verifyConfig({name: 'twitter'})).to.be.not.a('null');
    expect(Twitter.verifyConfig({name: 'twitter', user: 'test'})).to.be.not.a('null');
    expect(Twitter.verifyConfig({name: 'twitter', consumer_key: 'test'})).to.be.not.a('null');
    expect(Twitter.verifyConfig({name: 'twitter', consumer_key: 'test', consumer_secret: '1', user: 'test', access_token_key: '2', access_token_secret: '3'})).to.be.not.a('null');
  });

});


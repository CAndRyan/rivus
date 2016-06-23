'use strict';

var expect = require('chai').expect;
var nock = require('nock');

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

describe('providers.instagram', function() {
  it('should have a instagram provider that is not undefined', function () {
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
    expect(tw.get(2)).to.be.a('promise');
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

  it('Instagram item should be an object', function () {
    var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
    var Twitter = require('../providers/twitter');
    var tw = new Twitter(CONFIG);
    return tw.get(2).then(function (response) {
      expect(response[0]).to.be.a('object');
      expect(response[0].images).to.be.a('object');
    });
  });

});


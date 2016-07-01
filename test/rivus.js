'use strict';

var expect = require('chai').expect;
var nock = require('nock');
var Promise = require('es6-promise').Promise;

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

  it('getFeed method should return a Promise', function () {
    var Rivus = require('../rivus');
    var r = new Rivus();
    expect(r.getFeed(1)).to.be.an.instanceOf(Promise);
  });


  describe('rivus.promise', function() {
    it('then method should get an array', function () {
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

  describe('rivus.callback', function() {
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
    it('callback should get an array, request without count', function () {
      var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);

      var Rivus = require('../rivus');
      var r = new Rivus({
        providers: [{
          name: "rss",
          feed_url: 'http://www.example.org/export/1'
        }]
      });
      return r.getFeed(function (err, response) {
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

  });


  describe('rivus.config.file', function() {
    it('callback should get an array', function () {
      var twitter_mock = twitterFN();
      var insta_mock = instagramFN();
      var rss_mock = rssFn();
      var medium_user_mock = mediumUserFn();
      var medium_publication_mock = mediumPublicationFn();
      var medium_custom_mock = mediumCustomFn();

      var Rivus = require('../rivus');
      var r = new Rivus(__dirname + '/rivus_config.json');
      return r.getFeed(2, function (err, response) {
        expect(response).to.be.an('array');
        expect(err).to.be.a('null');
      });
    });

    it('config file with dot in filename should work', function () {
      var twitter_mock = twitterFN();
      var insta_mock = instagramFN();
      var rss_mock = rssFn();
      var medium_user_mock = mediumUserFn();
      var medium_publication_mock = mediumPublicationFn();
      var medium_custom_mock = mediumCustomFn();

      var Rivus = require('../rivus');
      var r = new Rivus(__dirname + '/rivus.config.json');
      return r.getFeed(2, function (err, response) {
        expect(response).to.be.an('array');
        expect(err).to.be.a('null');
      });
    });

    it('should ConfigError when an invalid file path', function () {
      var Rivus = require('../rivus');
      var r = new Rivus(__dirname + '/rivus-config.json');
      return r.getFeed(function (err, response) {
        expect(err.name).to.equal('ConfigError');
      });
    });

    it('should FeedRequestError when a service is 404', function () {
      var twitter_mock = twitterFN();
      var insta_mock = instagramFN();
      var medium_user_mock = mediumUserFn();
      var medium_publication_mock = mediumPublicationFn();
      var medium_custom_mock = mediumCustomFn();
      var HOST = 'http://www.example.org';
      var PATH = '/export/1';
      var RESPONSE = __dirname + '/replies/rss.rss';
      var mock = nock(HOST).get(PATH).replyWithFile(404, RESPONSE);

      var Rivus = require('../rivus');
      var r = new Rivus(__dirname + '/rivus_config.json');
      return r.getFeed(function (err, response) {
        expect(err.name).to.equal('FeedRequestError');
        expect(err.extra.status).to.equal(404);
      });
    });

  });
});

function twitterFN() {
  var HOST = 'https://api.twitter.com';
  var PATH = '/1.1/statuses/user_timeline.json?screen_name=%40user&count=2';
  var RESPONSE = __dirname + '/replies/twitter.json';
  return nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
}

function instagramFN() {
  var HOST = 'https://api.instagram.com';
  var PATH = '/v1/users/self/media/recent/?access_token=9370826248.6384ed0.d2925818be41442e398c9d490b6e1d2a';
  var RESPONSE = __dirname + '/replies/instagram.json';
  var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
}

function rssFn() {
  var HOST = 'http://www.example.org';
  var PATH = '/export/1';
  var RESPONSE = __dirname + '/replies/rss.rss';
  return nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
}

function mediumUserFn() {
  var HOST = 'https://medium.com';
  var PATH = '/feed/@user';
  var RESPONSE = __dirname + '/replies/medium_user.rss';
  return nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
}

function mediumPublicationFn() {
  var HOST = 'https://medium.com';
  var PATH = '/feed/publication';
  var RESPONSE = __dirname + '/replies/medium_publication.rss';
  return nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
}

function mediumCustomFn() {
  var HOST = 'http://www.example.org';
  var PATH = '/feed';
  var RESPONSE = __dirname + '/replies/medium_custom_domain.rss';
  return nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
}
'use strict';
var expect = require('chai').expect;
var nock = require('nock');
var Promise = require('es6-promise').Promise;

var PROVIDERS = [{name: 'instagram'}, {name: 'twitter'}, {name: 'rss'}, {name: 'medium'}];

var COMMON_FORMAT = {
  title: '',
  content: '',
  created_time: '',
  images: {},
  source: {
    name: '',
    feed: '',
    extra: {}
  }
};

describe('providers.format', function() {
  it('should have a Merge that is not undefined', function () {
    var Merge = require('../services/merge');
    expect(Merge).to.be.exist;
  });

  it('Merge should be return an array', function () {
    var merge = require('../services/merge');
    var ins = instagramFn();
    var tw = twitterFn();
    var rss = rssFn();
    var md = mediumFn();

    var getPromises = [ins, tw, rss, md].map(function getProviderFeed(provider) {
      return provider.get(2);
    });
    return Promise.all(getPromises).then(merge.bind(null, PROVIDERS))
      .then(function (response) {
        expect(response).to.be.a('array');
      });
  });
  it('Merge should be return an array length 8', function () {
    var merge = require('../services/merge');
    var ins = instagramFn();
    var tw = twitterFn();
    var rss = rssFn();
    var md = mediumFn();

    var getPromises = [ins, tw, rss, md].map(function getProviderFeed(provider) {
      return provider.get(2);
    });
    return Promise.all(getPromises).then(merge.bind(null, PROVIDERS))
      .then(function (response) {
        expect(response).to.have.lengthOf(8);
      });
  });

  it('Feed item should be equal to the common format', function () {
    var merge = require('../services/merge');
    var ins = instagramFn();
    var tw = twitterFn();
    var rss = rssFn();
    var md = mediumFn();

    var getPromises = [ins, tw, rss, md].map(function getProviderFeed(provider) {
      return provider.get(2);
    });
    return Promise.all(getPromises).then(merge.bind(null, PROVIDERS))
      .then(function (response) {
        response.forEach(function (item) {
          expect(item).to.have.all.keys(COMMON_FORMAT);
          expect(item.title).to.be.a('string');
          expect(item.content).to.be.a('string');
          expect(item.created_time).to.be.a('string');
          expect(item.images).to.be.an('object');
          expect(item.source).to.be.an('object');
          expect(item.source.name).to.be.a('string');
          expect(item.source.feed).to.be.a('string');
          expect(item.source.extra).to.be.an('object');
        });
      });
  });
});


function instagramFn() {
  var Instagram = require('../providers/instagram');
  var HOST = 'https://api.instagram.com';
  var PATH = '/v1/users/self/media/recent/?access_token=_CRDjNF8MEZoC9yq8xqbciPdp7jolx38FnP4i3PNRyQVXe3shtmqg3ZFJSQFCqakbKJCpY_HpG8dEOgSSkeWNBdXax8gA';
  var RESPONSE = __dirname + '/replies/instagram.json';
  var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);

  return new Instagram({
    name: 'instagram',
    access_token: '_CRDjNF8MEZoC9yq8xqbciPdp7jolx38FnP4i3PNRyQVXe3shtmqg3ZFJSQFCqakbKJCpY_HpG8dEOgSSkeWNBdXax8gA'
  });
}

function twitterFn() {
  var HOST = 'https://api.twitter.com';
  var PATH = '/1.1/statuses/user_timeline.json?screen_name=user&count=2';
  var RESPONSE = __dirname + '/replies/twitter.json';
  var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
  var Twitter = require('../providers/twitter');
  return new Twitter({
    name: 'twitter',
    user: 'user',
    consumer_key: 'dadadad',
    consumer_secret: '432432424',
    access_token_key: 'rewrwerwerwe',
    access_token_secret: '3123131'
  });
}

function rssFn() {
  var HOST = 'http://www.example.org';
  var PATH = '/export/1';
  var RESPONSE = __dirname + '/replies/rss.rss';
  var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
  var Rss = require('../providers/rss');
  return new Rss({
    name: 'rss',
    feed_url: 'http://www.example.org/export/1'
  });
}

function mediumFn() {
  var HOST = 'https://medium.com';
  var PATH = '/feed/@davepell';
  var RESPONSE = __dirname + '/replies/medium_user.rss';
  var mock = nock(HOST).get(PATH).replyWithFile(200, RESPONSE);
  var Medium = require('../providers/medium');
  return new Medium({
    name: 'medium',
    user: '@davepell'
  });
}
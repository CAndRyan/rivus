'use strict';
var expect = require('chai').expect;
var nock = require('nock');
var Promise = require('es6-promise').Promise;

var PROVIDERS = [{name: 'instagram'}, {name: 'twitter'}, {name: 'rss'}, {name: 'medium'}];

var COMMON_FORMAT = {
  id: '',
  title: '',
  content: '',
  created_time: '',
  images: {},
  link: '',
  extra: {},
  source: {
    name: '',
    feed: ''
  }
};

describe('providers.format', function() {
  it('should have a Merge that is not undefined', function() {
    var Merge = require('../services/merge');
    expect(Merge).to.be.exist;
  });

  it('Merge should be return an array', function() {
    var merge = require('../services/merge');
    var ins = instagramFn();
    var tw = twitterFn();
    var rss = rssFn();
    var md = mediumFn();

    var getPromises = [ins, tw, rss, md].map(function getProviderFeed(provider) {
      return provider.get(2);
    });
    return Promise.all(getPromises).then(merge)
      .then(function(response) {
        expect(response).to.be.a('array');
      });
  });

  it('Feed items should have common format', function() {
    var merge = require('../services/merge');
    var ins = instagramFn();
    var tw = twitterFn();
    var rss = rssFn();
    var md = mediumFn();
    var fb = facebookFn();

    var getPromises = [ins, tw, rss, md, fb].map(function getProviderFeed(provider) {
      return provider.get(2);
    });

    return Promise.all(getPromises).then(merge)
      .then(function(response) {
        response.forEach(function(item) {
          expect(item).to.have.all.keys(COMMON_FORMAT);

          expect(item.id).to.be.a('string');
          switch (item.source.name) {
            case 'facebook':
              expect(item.id.indexOf('fb:')).to.eql(0);
              break;
            case 'instagram':
              expect(item.id.indexOf('inst:')).to.eql(0);
              break;
            case 'medium':
              expect(item.id.indexOf('md:')).to.eql(0);
              break;
            case 'twitter':
              expect(item.id.indexOf('twi:')).to.eql(0);
              break;
            case 'rss':
              expect(item.id.indexOf('rss:http')).to.eql(0);
              break;
            default:
              fail('unexpected item source name: ' + item.source.name);
          }

          if (item.title !== undefined) {
            expect(item.title).to.be.a('string');
          }

          expect(item.content).to.be.a('string');
          expect(item.created_time.isValid()).to.be.true;
          expect(item.images).to.be.an('object');
          expect(item.source).to.be.an('object');
          expect(item.source.name).to.be.a('string');
          expect(item.source.feed).to.be.a('string');
          expect(item.extra).to.be.an('object');
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

function facebookFn() {
  nock('https://graph.facebook.com')
    .get('/oauth/access_token')
    .query({client_id: 'app_id', client_secret: 'app_secret', grant_type: 'client_credentials'})
    .reply(200, function() {
      return 'access_token=app_id|app_secret';
    });

  nock('https://graph.facebook.com', {reqheaders: {'access-token': 'app_id|app_secret'}})
    .get('/12345/feed')
    .query({fields: 'message,link,message_tags,name,picture,full_picture,type,created_time,source,story_tags'})
    .replyWithFile(200, __dirname + '/replies/facebook.json');

  var Facebook = require('../providers/facebook');
  return new Facebook({
    user_id: '12345',
    app_id: 'app_id',
    app_secret: 'app_secret'
  });
}

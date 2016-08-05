"use strict";

var expect = require('chai').expect;
var Promise = require('es6-promise').Promise;

describe('services.feed', function() {
  var Config = require('../services/config');

  it('should have a service that is not undefined', function() {
    var Feed = require('../services/feed');
    expect(Feed).to.be.exist;
    var feed = new Feed(new Config({
      "providers": []
    }));
    expect(feed).to.be.exist;
  });

  it('get method should return a Promise', function() {
    var Feed = require('../services/feed');
    var feed = new Feed(new Config({
      "providers": []
    }));
    expect(feed.get(10)).to.be.an.instanceOf(Promise);
  });

  it('has a feed id which uniquely describes all providers', function() {
    var Feed = require('../services/feed');

    var feed1 = new Feed(new Config({
      providers: PROVIDERS_CONFIG_1
    }));

    var feed2 = new Feed(new Config({
      providers: PROVIDERS_CONFIG_2
    }));

    return Promise.all([
      feed1.getFeedId().then(function checkFeedId1(feedId) {
        expect(feedId).to.eql(EXPECTED_FEED_ID);
      }),
      feed2.getFeedId().then(function checkFeedId2(feedId) {
        expect(feedId).to.eql(EXPECTED_FEED_ID);
      })
    ])
  });

  it('maintains order of passed providers', function() {
    var Feed = require('../services/feed');

    var feed = new Feed(new Config({
      providers: PROVIDERS_CONFIG_1
    }));

    function ids(providers) {
      return providers.map(function(p) {
        return p.feedId;
      }).join('|');
    }

    return feed.getProviders().then(function(providers) {
      expect(ids(providers)).to.eql(EXPECTED_IDS_IN_ORDER);

      return feed.getFeedId().then(function(feedId) {
        return feed.getProviders().then(function(sameProviders) {
          expect(feedId).to.eql(EXPECTED_FEED_ID);
          expect(ids(sameProviders)).to.eql(EXPECTED_IDS_IN_ORDER);
        });
      });
    });
  });
});

var EXPECTED_FEED_ID = 'facebook:user:12345|instagram:@r534134|medium:publication:publication|medium:publication_with_custom_domain:http://www.example.org|medium:user:@user|rss:http://www.example.org/export/1|twitter:@user';
var EXPECTED_IDS_IN_ORDER = 'rss:http://www.example.org/export/1|instagram:@r534134|medium:user:@user|medium:publication:publication|medium:publication_with_custom_domain:http://www.example.org|facebook:user:12345|twitter:@user';

var PROVIDERS_CONFIG_1 = [{
  "name": "rss",
  "feed_url": "http://www.example.org/export/1"
}, {
  "name": "instagram",
  "user": "@r534134",
  "access_token": "9370826248.6384ed0.d2925818be41442e398c9d490b6e1d2a"
}, {
  "name": "medium",
  "user": "@user"
}, {
  "name": "medium",
  "publication": "publication"
}, {
  "name": "medium",
  "publication_with_custom_domain": "http://www.example.org"
}, {
  "name": "facebook",
  "user_id": "12345",
  "app_id": "app_id",
  "app_secret": "app_secret"
}, {
  "name": "twitter",
  "user": "@user",
  "consumer_key": "gjQ0Pe2v2fweqwzPYuKVjKzDN",
  "consumer_secret": "bGbPbmxFVrBpdxiyzAIlSc5eRw3UyMP6N7JtBpCpVBUUrXUbw9",
  "access_token_key": "2375935312-i9zfVadxE9I9U8yUerYpcrFWJziKS7Jw98Bu88k",
  "access_token_secret": "TPlCtaiWcbJ2NqOsqk8lnOPGdKBasOB1201smsoX17aDM"
}];

var PROVIDERS_CONFIG_2 = [{
  "name": "rss",
  "feed_url": "http://www.example.org/export/1"
}, {
  "name": "twitter",
  "user": "@user",
  "consumer_key": "gjQ0Pe2v2fweqwzPYuKVjKzDN",
  "consumer_secret": "bGbPbmxFVrBpdxiyzAIlSc5eRw3UyMP6N7JtBpCpVBUUrXUbw9",
  "access_token_key": "2375935312-i9zfVadxE9I9U8yUerYpcrFWJziKS7Jw98Bu88k",
  "access_token_secret": "TPlCtaiWcbJ2NqOsqk8lnOPGdKBasOB1201smsoX17aDM"
}, {
  "name": "instagram",
  "user": "@r534134",
  "access_token": "9370826248.6384ed0.d2925818be41442e398c9d490b6e1d2a"
}, {
  "name": "medium",
  "user": "@user"
}, {
  "name": "medium",
  "publication_with_custom_domain": "http://www.example.org"
}, {
  "name": "medium",
  "publication": "publication"
}, {
  "name": "facebook",
  "user_id": "12345",
  "app_id": "app_id",
  "app_secret": "app_secret"
}];

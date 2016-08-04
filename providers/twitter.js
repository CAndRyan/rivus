'use strict';

var Promise = require('es6-promise').Promise;
var TwitterApi = require('twitter');
var errors = require('../common/errors');
var feedUtils = require('../common/feedUtils');

function Twitter(config) {
  var currentFeedId = feedId(config.name, config.user);

  this.name = config.name;
  this.user = config.user;
  this.id = currentFeedId;

  this.api = new TwitterApi({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret
  });

  Object.defineProperty(this, 'feedId', {
    get: function getFeedId() {
      return currentFeedId;
    }
  });
}

Twitter.prototype.get = function twitterGet(count) {
  return this.getPage(count).then(function returnPosts(data) {
    return data.posts;
  });
};

Twitter.prototype.getPage = function getPage(count, pageToken) {
  var currentFeedId = this.feedId;

  var twitter = this.api;
  var params = {
    screen_name: this.user, // the user id passed in as part of the route
    count: count
  };

  if (pageToken) {
    params.max_id = pageToken;
  }

  return new Promise(function executor(resolve, reject) {
    twitter.get('statuses/user_timeline', params, function success(err, tweets) {
      if (err) {
        return reject(new errors.FeedRequestError('twitter', currentFeedId, 'api request failed', err));
      }

      var items = tweets.map(model.bind(null, currentFeedId));
      return resolve({
        posts: items,
        nextPageToken: items.length ? items[items.length - 1].id : null
      });
    });
  });
};

Twitter.verifyConfig = function verifyTwitterConfig(config) {
  if (!config.user || !config.consumer_key || !config.consumer_secret || !config.access_token_key || !config.access_token_secret) {
    return new Error('twitter provider: all config properties must be given');
  }
  if (config.user && !/^@/.exec(config.user)) {
    return new Error('twitter provider: user name should start with a @');
  }

  return null;
};

function model(currentFeedId, item) {
  var original = feedUtils.prefix(item, 'tw-');
  return {
    id: 'twi:' + item.id,
    title: item.text.substring(0, 20),
    content: item.text,
    created_time: item.created_at,
    images: images(item.extended_entities),
    extra: original,
    link: 'https://twitter.com/' + item.user.screen_name + '/status/' + item.id_str,
    source: {
      name: 'twitter',
      feed: currentFeedId
    }
  };
}

function images(entities) {
  if (!entities || !Array.isArray(entities.media) || !entities.media[0]) {
    return {};
  }

  return {
    thumbnail: {
      url: entities.media[0].media_url
    }
  };
}

function feedId(name, user) {
  return name + ':' + user;
}

module.exports = Twitter;

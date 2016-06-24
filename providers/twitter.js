'use strict';

var Promise = require('es6-promise').Promise;
var TwitterApi = require('twitter');
var moment = require('moment');
var errors = require('../common/errors');

function Twitter(config) {
  this.name = config.name;
  this.user = config.user;
  this.id = feedId(config.name, config.user);
  this.api = new TwitterApi({
    consumer_key: config.consumer_key,
    consumer_secret: config.consumer_secret,
    access_token_key: config.access_token_key,
    access_token_secret: config.access_token_secret
  });
}

Twitter.prototype.get = function twitterGet(count) {
  var self = this;
  var params = {
    screen_name: this.user, // the user id passed in as part of the route
    count: count
  };
  return new Promise(function executor(resolve, reject) {
    self.api.get('statuses/user_timeline', params, function success(err, tweets, response) {
      if (err) {
        return reject(new errors.FeedRequestError(self.name, self.id, 'api' +
            ' request failed', err));
      }
      return resolve(prepare.call(self, tweets, count));
    });
  });
};

Twitter.verifyConfig = function verifyTwitterConfig(config) {
  if (!config.user || !config.consumer_key || !config.consumer_secret || !config.access_token_key || !config.access_token_secret) {
    return new Error('twitter provider: all config properties must be given');
  }

  return null;
};

function prepare(response, count) {
  return response.slice(0, count).map(model, this);
}

function model(item) {
  var original = prefix(item, 'tw-');
  return {
    title: item.text.substring(0, 20),
    content: item.text,
    created_time: moment(new Date(item.created_at)).toString(),
    images: images(item.extended_entities),
    source: {
      name: this.name,
      feed: this.id,
      extra: original
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

function prefix(obj, pref) {
  var out = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      out[pref + key] = obj[key];
    }
  }
  return out;
}

function feedId(name, user) {
  return name + ':' + user;
}

module.exports = Twitter;

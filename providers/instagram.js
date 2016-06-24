'use strict';

var Promise = require('es6-promise').Promise;
var InstagramAPI = require('instagram-api');
var moment = require('moment');
var errors = require('../common/errors');

function Instagram(config) {
  this.name = config.name;
  this.api = new InstagramAPI(config.access_token);
  this.user = config.user;
  this.id = feedId(config.name, config.user);
}

Instagram.prototype.get = function getInstagram(count) {
  var self = this;
  return new Promise(function executor(resolve, reject) {
    self.api.userSelfMedia()
      .then(function success(response) {
        return resolve(prepare.call(self, response.data, count));
      })
      .catch(function error(err) {
        return reject(new errors.FeedRequestError(self.name, self.id, 'api' +
          ' request failed', err));
      });
  });
};

Instagram.verifyConfig = function verifyInstagramConfig(config) {
  if (config.user && !/^@/.exec(config.user)) {
    return new Error('instagram provider: user name should start with a @');
  }

  if (!config.access_token) {
    return new Error('instagram provider: access_token must be given');
  }
  if (!config.user) {
    return new Error('instagram provider: user must be given');
  }

  return null;
};

function prepare(response, count) {
  return response.slice(0, count).map(model, this);
}

function model(item) {
  var original = prefix(item, 'in-');
  return {
    title: item.caption.text.substring(0, 20),
    content: item.caption.text,
    created_time: moment.unix(item.created_time).toString(),
    images: {
      thumbnail: {
        url: item.images.thumbnail.url
      }
    },
    source: {
      name: this.name,
      feed: this.id,
      extra: original
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

module.exports = Instagram;

'use strict';

var Promise = require('es6-promise').Promise;
var InstagramAPI = require('instagram-api');
var errors = require('../common/errors');
var feedUtils = require('../common/feedUtils');

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
  var original = feedUtils.prefix(item, 'in-');
  return {
    title: item.caption && item.caption.text.substring(0, 20),
    content: item.caption && item.caption.text,
    created_time: date(item.created_time),
    images: {
      thumbnail: {
        url: item.images.thumbnail.url
      }
    },
    extra: original,
    source: {
      name: this.name,
      feed: this.id
    }
  };
}

function feedId(name, user) {
  return name + ':' + user;
}

function date(createdDate) {
  return createdDate * 1000;
}

module.exports = Instagram;

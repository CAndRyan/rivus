'use strict';

var Promise = require('es6-promise').Promise;
var InstagramAPI = require('instagram-api');
var moment = require('moment');

function Instagram(config) {
  this.name = config.name;
  this.instagramAPI = new InstagramAPI(config.access_token);
}

Instagram.prototype.get = function getInstagram(count, callback) {
  var self = this;
  return new Promise(function executor(resolve, reject) {
    self.instagramAPI.userSelfMedia()
      .then(function success(response) {
        if (callback) {
          callback(null, prepare(response.data, count));
        }
        return resolve(prepare(response.data, count));
      }, function error(err) {
        if (callback) {
          callback(err, null);
        }
        return reject(err);
      });
  });
};

function prepare(response, count) {
  return response.slice(0, count).map(model);
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
      feed: original
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

module.exports = Instagram;

'use strict';
var Promise = require('es6-promise').Promise;
var feed = require('feed-read');
var moment = require('moment');

function Rss(config) {
  this.name = config.name;
  this.url = config.feed_url;
}

Rss.prototype.get = function getRss(count, callback) {
  var self = this;
  return new Promise(function executor(resolve, reject) {
    feed(self.url, function feedCallback(err, response) {
      if (err) {
        if (callback) {
          callback(err, null);
        }
        return reject(err);
      }
      if (callback) {
        callback(null, prepare(response, count));
      }
      return resolve(prepare(response, count));
    });
  });
};

function prepare(response, count) {
  return response.slice(0, count).map(model);
}

function model(item) {
  var original = prefix(item, 'rss-');
  return {
    title: item.title,
    content: item.content,
    created_time: moment(item.published).toString(),
    images: images(item.content),
    source: {
      feed: original
    }
  };
}

function images(content) {
  var rex = /src="([^"]*)"/i;
  var match = rex.exec(content);
  if (Array.isArray(match) && match[1]) {
    return {
      thumbnail: {
        url: match[1]
      }
    };
  }
  return {};
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

module.exports = Rss;

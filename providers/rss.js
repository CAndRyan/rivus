'use strict';
var Promise = require('es6-promise').Promise;
var feed = require('feed-read');
var moment = require('moment');
var errors = require('../common/errors');
var url = require('url');

function Rss(config) {
  this.name = config.name;
  this.url = config.feed_url;
  this.id = config.id || feedId(config.name, config.feed_url);
}

Rss.prototype.get = function getRss(count) {
  var self = this;
  return new Promise(function executor(resolve, reject) {
    feed(self.url, function feedCallback(err, response) {
      if (err) {
        return reject(new errors.FeedRequestError(self.name, self.id, 'api' +
            ' request failed', err));
      }
      return resolve(prepare.call(self, response, count));
    });
  });
};

Rss.verifyConfig = function verifyRssConfig(config) {
  if (config.feed_url) {
    try {
      var domainUrl = url.parse(config.feed_url);
      if (!domainUrl.host) {
        return new Error('rss provider: feed_url must' +
          ' have a valid domain');
      }
    } catch (e) {
      return new Error('rss provider: feed_url must' +
        ' have a valid domain');
    }
  }

  if (!config.feed_url) {
    return new Error('rss provider: feed_url must be given');
  }

  return null;
};

function prepare(response, count) {
  return response.slice(0, count).map(model, this);
}

function model(item) {
  var original = prefix(item, 'rss-');
  return {
    title: item.title,
    content: item.content,
    created_time: moment(item.published).toString(),
    images: images(item.content),
    source: {
      name: this.name,
      feed: this.id,
      extra: original
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

function feedId(name, id) {
  return name + ':' + id;
}

module.exports = Rss;

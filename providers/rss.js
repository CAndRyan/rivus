'use strict';
var Promise = require('es6-promise').Promise;
var feed = require('feed-read');
var errors = require('../common/errors');
var url = require('url');
var feedUtils = require('../common/feedUtils');

function Rss(config) {
  this._config = config;

  Object.defineProperty(this, 'feedId', {
    get: function getFeedId() {
      return this._feedId();
    }.bind(this)
  });
}

Rss.prototype.get = function getRss(count) {
  var feedUrl = this._config.feed_url;
  var providerName = this._config.name;
  var feedId = this.feedId;

  return new Promise(function executor(resolve, reject) {
    feed(feedUrl, function feedCallback(err, response) {
      if (err) {
        return reject(new errors.FeedRequestError(
          providerName, feedId, 'api request failed', err
        ));
      }
      return resolve(this._cookResponse(response, count));
    }.bind(this));
  }.bind(this));
};

Rss.prototype.getPage = function getPage(count) {
  return this.get(count).then(function returnPage(posts) {
    return {
      posts: posts,
      pageToken: null
    };
  });
};

Rss.prototype._feedId = function getFeedId() {
  return 'rss:' + this._config.feed_url;
};

Rss.prototype._itemId = function getItemId(item) {
  return 'rss:' + item.link;
};

Rss.prototype._cookResponse = function cookResponse(response, count) {
  return response.slice(0, count).map(this._cookItem, this);
};

Rss.prototype._cookItem = function cookItem(item) {
  var original = feedUtils.prefix(item, 'rss-');
  return {
    id: this._itemId(item),
    title: item.title,
    content: item.content,
    created_time: item.published,
    images: images(item.content),
    link: item.link,
    extra: original,
    source: {
      name: this._config.name,
      feed: this._feedId(this._config)
    }
  };
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

module.exports = Rss;

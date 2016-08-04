'use strict';

var https = require('https');
var querystring = require('querystring');
var Promise = require('es6-promise').Promise;
var errors = require('../common/errors');
var feedUtils = require('../common/feedUtils');

function Instagram(config) {
  var currentFeedId = feedId(config.name, config.user);

  this.name = config.name;
  this.id = currentFeedId;
  this._accessToken = config.access_token;

  Object.defineProperty(this, 'feedId', {
    get: function getFeedId() {
      return currentFeedId;
    }
  });
}

Instagram.prototype.get = function getInstagram(count) {
  return this.getPage(count).then(function returnPosts(data) {
    return data.posts;
  });
};

Instagram.prototype.getPage = function getPage(count, pageToken) {
  var currentFeedId = this.feedId;
  var baseUrl = 'https://api.instagram.com/v1/users/self/media/recent/';
  var params = { access_token: this._accessToken };
  if (pageToken) {
    params.next_max_id = pageToken;
  }

  var url = baseUrl + '?' + querystring.stringify(params);

  return new Promise(function requestInstagramPage(resolve, reject) {
    https.get(url, function readInstagramResponse(message) {
      message.on('data', function processInstagramResponse(responseData) {
        resolve(JSON.parse(responseData.toString('utf8')));
      });
    })
      .on('error', function processInstagramResponseError(error) {
        reject(new errors.FeedRequestError('instagram', currentFeedId, 'network request failure', { error: error }));
      });
  }).then(function processInstagramResponse(response) {
    if (response.meta.code !== 200) {
      throw new errors.FeedRequestError('instagram', currentFeedId, response.meta.error_message, response.meta);
    }
    return {
      posts: response.data.map(model.bind(null, currentFeedId)),
      nextPageToken: response.pagination.next_max_id
    };
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
    return new Error('instagram provider: user name must be provided');
  }

  return null;
};

function model(currentFeedId, item) {
  var original = feedUtils.prefix(item, 'in-');
  return {
    id: 'inst:' + item.id,
    title: item.caption && item.caption.text.substring(0, 20),
    content: item.caption && item.caption.text,
    created_time: date(item.created_time),
    images: {
      thumbnail: {
        url: item.images.thumbnail.url
      },
      content: {
        url: item.images.standard_resolution.url
      }
    },
    link: item.link,
    extra: original,
    source: {
      name: 'instagram',
      feed: currentFeedId
    }
  };
}

function feedId(name, user) {
  return name + ':' + (user || 'own');
}

function date(createdDate) {
  return createdDate * 1000;
}

module.exports = Instagram;

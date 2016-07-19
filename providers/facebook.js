'use strict';

var Promise = require('es6-promise').Promise;
var https = require('https');
var querystring = require('querystring');
var moment = require('moment');
var url = require('url');

var errors = require('../common/errors');

var FACEBOOK_HOST = 'graph.facebook.com';

function FacebookAccessToken(appId, appSecret) {
  this._secrets = {
    appId: appId,
    appSecret: appSecret
  };
  this._promise = null;
}

function feedIdForUserId(userId) {
  return 'facebook:user:' + userId;
}

function graphApiRequest(endpoint, feedId, accessToken) {
  return new Promise(function makeRequest(resolve, reject) {
    function handleError(message, facebookErrorDescription) {
      var extra = null;
      if (facebookErrorDescription) {
        extra.facebookErrorCode = facebookErrorDescription.code;
        extra.facebookErrorSubcode = facebookErrorDescription.error_subcode;
        extra.facebookHumanTitle = facebookErrorDescription.error_user_title;
        extra.facebookHumanMessage = facebookErrorDescription.error_user_message;
      }
      reject(new errors.FeedRequestError('facebook', feedId, message, extra));
    }

    var headers = {};
    if (accessToken) {
      headers['access-token'] = accessToken;
    }

    var request = https.get({
      hostname: endpoint.hostname,
      path: endpoint.path,
      headers: headers
    }, function onResponse(message) {
      message.on('data', function onResponseData(responseData) {
        if (message.statusCode !== 200) {
          var errorMessage = 'graph api request failed';
          var errorExtra = null;

          try {
            var json = JSON.parse(responseData.toString('utf8'));
            if (json.error) {
              errorMessage = 'error ' + json.error.code + ': ' + json.error.message;
              errorExtra = json.error;
            } else {
              errorMessage = 'HTTP ' + message.statusCode + ' ' + message.statusMessage;
            }
          } catch (e) {
            errorMessage = 'error processing graph api response: ' + e.message;
          }

          handleError(errorMessage, errorExtra);
          return;
        }

        try {
          var responseString = responseData.toString('utf8');
          var plainResponse = !accessToken;

          if (plainResponse) {
            resolve(responseString);
          } else {
            resolve(JSON.parse(responseString));
          }
        } catch (e) {
          handleError('error processing graph api response: ' + e.message);
        }
      });
    });

    request.on('error', function onError(error) {
      handleError('graph api request error: ' + error.message);
    });
  });
}

function cookFeedPost(feedId, post) {
  function parseImages() {
    var images = {};

    if (post.picture && post.picture.length) {
      images.thumbnail = {url: post.picture};
    }

    if (post.full_picture && post.full_picture.length) {
      images.content = {url: post.full_picture};
    }

    return images;
  }

  return {
    id: 'fb:' + post.id,
    title: post.name,
    content: post.message,
    created_time: moment(post.created_time).toString(),
    images: parseImages(),
    link: post.link,
    extra: {},
    source: {
      name: 'facebook',
      feed: feedId
    }
  };
}

function loadUserFeed(userId, accessToken, count, results, continuationUrl) {
  var feedId = feedIdForUserId(userId);

  var endpoint;
  if (continuationUrl) {
    endpoint = url.parse(continuationUrl);
  } else {
    var params = {
      fields: 'message,link,message_tags,name,picture,full_picture,type,created_time,source,story_tags'
    };
    endpoint = url.parse('https://' + FACEBOOK_HOST + '/' + userId + '/feed?' + querystring.encode(params));
  }

  return graphApiRequest(endpoint, feedId, accessToken)
    .then(function processResponse(response) {
      var newResults = results.concat(response.data.map(cookFeedPost.bind(null, feedId)));
      var nextPageUrl = (response.paging || {}).next;
      if (!!count && newResults.length < count) {
        return loadUserFeed(userId, accessToken, count, newResults, nextPageUrl);
      }
      return newResults;
    });
}

FacebookAccessToken.prototype.request = function requestFacebookAccessToken(feedId) {
  if (this._promise) {
    return this._promise;
  }

  var params = {
    client_id: this._secrets.appId,
    client_secret: this._secrets.appSecret,
    grant_type: 'client_credentials'
  };

  var endpoint = url.parse('https://' + FACEBOOK_HOST + '/oauth/access_token?' + querystring.encode(params));

  this._promise = graphApiRequest(endpoint, feedId)
    .then(function parseAccessToken(responseString) {
      var items = responseString.split('=');
      if (items.length === 2 && items[0] === 'access_token') {
        return items[1];
      }

      throw new errors.FeedRequestError(
        'facebook', feedId, 'unexpected access token response format'
      );
    });

  return this._promise;
};

FacebookAccessToken.prototype.invalidate = function invalidateFacebookAccessToken() {
  this._promise = null;
};


function Facebook(config) {
  var userId = config.user_id;
  var feedId = feedIdForUserId(userId);

  this._accessToken = new FacebookAccessToken(config.app_id, config.app_secret);
  this._userId = userId;

  Object.defineProperty(this, 'feedId', {
    get: function getFeedId() {
      return feedId;
    }
  });
}

Facebook.prototype.get = function getFacebookFeed(count) {
  var userId = this._userId;

  return this._requestAccessToken().then(function withAccessToken(accessToken) {
    return loadUserFeed(userId, accessToken, count, []);
  });
};

Facebook.prototype._requestAccessToken = function requestFacebookAccessToken() {
  return this._accessToken.request(this.feedId);
};

Facebook.prototype._invalidateAccessToken = function invalidateFacebookAccessToken() {
  this._accessToken.invalidate();
};

Facebook.prototype.verifyConfig = function verifyFacebookConfig(config) {
  if (!config.app_key || !config.app_secret) {
    return new errors.ConfigError('Facebook provider: app_key and app_secret should be given');
  }

  if (!config.user_id) {
    return new errors.ConfigError('Facebook provider: need user_id');
  }

  return null;
};


module.exports = Facebook;

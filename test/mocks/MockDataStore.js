var moment = require('moment');
var expect = require('chai').expect;
var assert = require('chai').assert;
var Promise = require('es6-promise').Promise;

var MockProvider = require('./MockProvider');

function MockDataStore(initialFeed) {
  this._providers = initialFeed._mockProviders;
  this._lastFeedDates = {};
  this._lastProviderDates = {};
  this._allPosts = {};
  this._postsByProvider = {};
  this._postsByFeed = {};

  var feedDates = [];
  var feedPostIds = [];
  this._lastFeedDates[initialFeed._feedId] = feedDates;
  this._postsByFeed[initialFeed._feedId] = feedPostIds;

  this._providers.forEach(function(provider) {
    feedDates.push(provider._lastPostDate);
    this._lastProviderDates[provider.feedId] = provider._lastPostDate;

    var providerPostIds = [];
    this._postsByProvider[provider.feedId] = providerPostIds;

    provider._posts.forEach(function(post) {
      this._allPosts[post.id] = post;
      providerPostIds.push(post.id);
      feedPostIds.push(post.id);
    }.bind(this));
  }.bind(this));
}

// READ store mock API

MockDataStore.prototype.synchronizeFeed = function synchronizeFeed(feed, updater) {
  var writeStore = new MockWriteDataStore(this);
  return updater(this._lastFeedDates[feed._feedId], writeStore)
    .then(function(newFeedDates) {
      expect(newFeedDates).to.be.an.instanceOf(Array);
      this._lastFeedDates[feed._feedId] = newFeedDates;
      return newFeedDates;
    }.bind(this));
};

MockDataStore.prototype.synchronizeProvider = function synchronizeProvider(provider, updater) {
  var writeStore = new MockWriteDataStore(this);
  return updater(this._lastProviderDates[provider.feedId], writeStore)
    .then(function(newProviderDate) {
      if (!!newProviderDate) {
        assert(moment.isMoment(newProviderDate), 'provider updater function must resolve with a date');
      } else {
        assert(provider._posts.length === 0, 'provider updater function must resolve with a null if provider is empty');
      }
      this._lastProviderDates[provider.feedId] = newProviderDate;
      return newProviderDate;
    }.bind(this));
};

MockDataStore.prototype.getProviderPostsInRange = function getProviderPostsInRange(provider, endDate, startDate) {
  return Promise.resolve(this._postsByProvider[provider.feedId]
    .filter(function(postId) {
      var date = postById(this._allPosts, postId).created_time;
      return date.isSameOrAfter(startDate) && date.isSameOrBefore(endDate);
    }, this)
    .map(postById.bind(null, this._allPosts)));
};

// WRITE store

function MockWriteDataStore(store) {
  this._store = store;
}

MockWriteDataStore.prototype.savePosts = function savePosts(posts) {
  posts.forEach(function(post) {
    this._store._allPosts[post.id] = post;
  }, this);
  return Promise.resolve();
};

MockWriteDataStore.prototype.addPostsToFeed = function addPostsToFeed(feed, posts) {
  posts.forEach(function(post) {
    this._store._postsByFeed[feed._feedId].push(post.id);
  }, this);

  var allPosts = this._store._allPosts;
  this._store._postsByFeed[feed._feedId].sort(function(p1, p2) {
    return MockProvider.comparePostsByDateDesc(postById(allPosts, p1), postById(allPosts, p2));
  });

  return Promise.resolve();
};

MockWriteDataStore.prototype.addPostsToProvider = function addPostsToProvider(provider, posts) {
  posts.forEach(function(post) {
    this._store._postsByProvider[provider.feedId].push(post.id);
  }, this);

  var allPosts = this._store._allPosts;
  this._store._postsByProvider[provider.feedId].sort(function(p1, p2) {
    return MockProvider.comparePostsByDateDesc(postById(allPosts, p1), postById(allPosts, p2));
  });

  return Promise.resolve();
};

// INSPECTION mock API

MockDataStore.prototype._lastDateForProvider = function getLastDateForProvider(provider) {
  return this._lastProviderDates[provider.feedId];
};

MockDataStore.prototype._postsForProvider = function getPostsForProvider(provider) {
  return this._postsByProvider[provider.feedId].map(postById.bind(null, this._allPosts));
};

MockDataStore.prototype._postsForFeed = function getPostsForFeed(feed) {
  return this._postsByFeed[feed._feedId].map(postById.bind(null, this._allPosts));
};

MockDataStore.prototype._lastDatesForFeed = function getLastDatesForFeed(feed) {
  return this._lastFeedDates[feed._feedId];
};

function postById(allPosts, postId) {
  assert(!!postId, 'data corruption: data store contains undefined post ids');
  assert(allPosts[postId], 'data corruption: data store contains post id without post body');
  return allPosts[postId];
}

module.exports = MockDataStore;

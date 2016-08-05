var Promise = require('es6-promise').Promise;

var MockProvider = require('./MockProvider');

function MockFeed(providers) {
  this._mockProviders = providers;

  Object.defineProperty(this, '_feedId', {
    get: function() {
      return this._mockProviders.slice().sort(function compareProviders(p1, p2) {
        var f1 = p1.feedId;
        var f2 = p2.feedId;

        if (f1 < f2) {
          return -1;
        } else if (f1 > f2) {
          return 1;
        }
        return 0;
      }).map(function providerToFeedId(provider) {
        return provider.feedId;
      }).join('|');
    }
  });

  Object.defineProperty(this, '_allPosts', {
    get: function() {
      return this._mockProviders
        .map(function(provider) {
          return provider._posts;
        })
        .reduce(function(allPosts, providerPosts) {
          return allPosts.concat(providerPosts);
        }, [])
        .sort(MockProvider.comparePostsByDateDesc);
    }
  });
}

MockFeed.prototype.getProviders = function() {
  return Promise.resolve(this._mockProviders);
};

MockFeed.prototype.getFeedId = function() {
  return Promise.resolve(this._feedId);
};

module.exports = MockFeed;

'use strict';

var Promise = require('es6-promise').Promise;
var moment = require('moment');
var deduplicate = require('./deduplicate');
var log = require('../common/log');


function synchronizeFeed(feed, dataStore) {
  return feed.getFeedId()
    .then(function doSynchronizeFeed(feedId) {
      log.info('synchronizing feed', feedId, '...');

      return feed.getProviders().then(function(providers) {
        return synchronizeEachProvider(dataStore, providers)
          .then(mergeProviderUpdatesToFeed.bind(null, feed, dataStore, providers))
          .then(
            function(result) {
              log.info('complete synchronizing feed', feedId);
              return result;
            },
            function(error) {
              log.error('error synchronizing feed', feedId, ': ', error);
              throw error;
            }
          );
      });
    });
}

function synchronizeEachProvider(dataStore, providers) {
  return Promise.all(providers.map(synchronizeProvider.bind(null, dataStore)));
}

function synchronizeProvider(dataStore, provider) {
  return dataStore.synchronizeProvider(provider, function doSynchronizeProvider(savedLastPostDate, writeStore) {
    return loadNewPostsFromProvider(provider, savedLastPostDate)
      .then(function addNewPostsToProvider(newPosts) {
        if (!newPosts.length) {
          return Promise.resolve(savedLastPostDate);
        }
        return writeStore.savePosts(newPosts)
          .then(writeStore.addPostsToProvider.bind(writeStore, provider, newPosts))
          .then(function() {
            return newPosts[0].created_time;
          });
      });
  });
}

function mergeProviderUpdatesToFeed(feed, dataStore, providers, newFeedDates) {
  return dataStore.synchronizeFeed(feed, function doSynchronizeFeed(savedFeedDates, writeStore) {
    const updates = collectUpdatesInFeed(providers, savedFeedDates, newFeedDates);

    if (!updates.length) {
      return Promise.resolve(savedFeedDates);
    }

    return getPostsFromUpdates(updates, dataStore)
      .then(writeStore.addPostsToFeed.bind(writeStore, feed))
      .then(collectUpdatedDateRange.bind(null, updates))
      .then(deduplicate.bind(null, feed, dataStore, writeStore))
      .then(function returnNewFeedDates() {
        return newFeedDates;
      });
  });
}

function collectUpdatesInFeed(providers, savedFeedDates, newFeedDates) {
  return providers
    .map(function getProviderUpdates(provider, index) {
      var startDate = savedFeedDates[index];
      var endDate = newFeedDates[index];

      if (!startDate && !endDate) {
        return null;
      } else if (!startDate) {
        startDate = moment(endDate).subtract(1, 'second');
      }

      return {
        provider: provider,
        startDate: startDate,
        endDate: endDate
      };
    })
    .filter(function filterChangedProviders(update) {
      return !!update && update.endDate.isAfter(update.startDate);
    });
}

function collectUpdatedDateRange(updates) {
  return updates.reduce(function reduceUpdates(range, update) {
    if (!range) {
      return {
        startDate: update.startDate,
        endDate: update.endDate
      };
    }

    return {
      startDate: update.startDate.isBefore(range.startDate) ? update.startDate : range.startDate,
      endDate: update.endDate.isAfter(range.endDate) ? update.endDate : range.endDate
    };
  });
}

function getPostsFromUpdates(updates, dataStore) {
  return Promise.all(updates.map(function(update) {
    return dataStore.getProviderPostsInRange(update.provider, update.endDate, update.startDate)
      .then(function(posts) {
        if (update.startDate.isSame(posts[posts.length - 1].created_time)) {
          return posts.slice(0, -1);
        }
        return posts;
      });
  })).then(function(postsByProvider) {
    return postsByProvider.reduce(function reducePosts(all, forCurrentProvider) {
      return all.concat(forCurrentProvider);
    }, []);
  });
}

function loadNewPostsFromProvider(provider, savedPostDate) {
  function loadNewPostsFromProviderRec(pageToken) {
    return provider.getPage(20, pageToken).then(function processNextPage(data) {
      var thisPagePosts = [];

      for (var i = 0; i < data.posts.length; i++) {
        var postDate = data.posts[i].created_time;

        if (!!savedPostDate && postDate.isSameOrBefore(savedPostDate)) {
          return thisPagePosts;
        }

        thisPagePosts.push(data.posts[i]);
      }

      if (!data.nextPageToken) {
        return thisPagePosts;
      }

      return loadNewPostsFromProviderRec(data.nextPageToken)
        .then(function mergePages(nextPagePosts) {
          return thisPagePosts.concat(nextPagePosts);
        });
    });
  }

  return loadNewPostsFromProviderRec([]);
}

module.exports = synchronizeFeed;

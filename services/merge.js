'use strict';

var newFeedItem = require('./feedItem');
var newFeedsList = require('./feedsList');

function Merge(feeds) {
  var concatFeeds = feeds.reduce(function feedsReducer(previousPosts, feedArray) {
    return previousPosts.concat(feedArray.map(newFeedItem));
  }, []);
  return newFeedsList(concatFeeds);
}


module.exports = Merge;

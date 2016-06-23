'use strict';
function FeedsList(feeds) {
  this.setData(feeds);
  return this.feeds;
}

FeedsList.prototype.setData = function setData(feeds) {
  this.feeds = feeds;
};

module.exports = function newFeedsList(feeds) {
  return new FeedsList(feeds);
};

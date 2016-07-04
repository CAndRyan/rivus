'use strict';

function sortBy(param, feeds) {
  if (param === 'date') {
    feeds.sort(function sortFeedsDate(left, right) {
      return right.created_time.diff(left.created_time);
    });
  }
}

module.exports = function newFeedsList(feeds) {
  sortBy('date', feeds);
  return feeds;
};

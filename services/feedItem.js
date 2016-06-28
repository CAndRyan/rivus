'use strict';

var moment = require('moment');

function FeedItem(feedItem) {
  setData.call(this, feedItem);
}

function setData(obj) {
  obj.created_time = date(obj.created_time);
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      this[key] = obj[key];
    }
  }
}

function date(str) {
  return moment(new Date(str).getTime());
}

module.exports = function newFeedItem(feedItem, meta) {
  return new FeedItem(feedItem, meta);
};

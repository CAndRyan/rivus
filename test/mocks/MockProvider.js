var moment = require('moment');
var Promise = require('es6-promise').Promise;

function MockProvider(name) {
  this._posts = [];
  this._idGen = 1;
  this._name = name;

  Object.defineProperty(this, 'feedId', {
    value: 'mock:' + name
  });

  Object.defineProperty(this, '_lastPostDate', {
    get: function() {
      if (this._posts.length) {
        return this._posts[0].created_time;
      } else {
        return null;
      }
    }
  });
}

MockProvider.prototype.addPosts = function addMockPosts(count, startDate) {
  var date = startDate;

  for (var i = 0; i < count; i++) {
    this._posts.push({
      id: this.feedId + ':' + this._idGen,
      title: 'Test Post',
      content: 'Test Post Content',
      created_time: date,
      images: {},
      link: 'http://test.com/',
      extra: {},
      source: {
        name: this._name,
        feed: this.feedId
      }
    });

    date = moment(date).add(10, 'second');
    this._idGen = this._idGen + 1;
  }

  this._posts.sort(MockProvider.comparePostsByDateDesc);
};

MockProvider.prototype.getPage = function getPage(count, pageToken) {
  var start = 0;
  var end = Math.min(start + count, this._posts.length);

  if (pageToken && pageToken.nextIndex) {
    start = pageToken.nextIndex;
    end = Math.min(start + count, this._posts.length);
  }

  return Promise.resolve({
    posts: this._posts.slice(start, end),
    nextPageToken: end < this._posts.length
      ? { nextIndex: end }
      : null
  });
};

MockProvider.comparePostsByDateDesc = function comparePostsByDate(p1, p2) {
  if (p1.created_time.isBefore(p2.created_time)) {
    return 1;
  } else if (p1.created_time.isAfter(p2.created_time)) {
    return -1;
  } else {
    return 0;
  }
};

module.exports = MockProvider;

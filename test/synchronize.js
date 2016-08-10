'use strict';

var moment = require('moment');

var MockProvider = require('./mocks/MockProvider');
var MockFeed = require('./mocks/MockFeed');
var MockDataStore = require('./mocks/MockDataStore');

var synchronize = require('../services/synchronize');

var expect = require('chai').expect;

describe('synchronization', function() {
  it('completes successfully if nothing changed', function() {
    var foo = new MockProvider('foo');
    foo.addPosts(10, moment.unix(0));

    var bar = new MockProvider('bar');
    bar.addPosts(10, moment.unix(1000));

    var baz = new MockProvider('baz');
    baz.addPosts(5, moment.unix(1800));

    var feed = new MockFeed([foo, bar, baz]);

    var dataStore = new MockDataStore(feed);

    return synchronize(feed, dataStore)
      .then(function(lastFeedDates) {
        expect(lastFeedDates).to.be.an.instanceOf(Array);
        expect(lastFeedDates.length).to.eql(3);
        expect(foo._lastPostDate.isSame(lastFeedDates[0])).to.be.true;
        expect(bar._lastPostDate.isSame(lastFeedDates[1])).to.be.true;
        expect(baz._lastPostDate.isSame(lastFeedDates[2])).to.be.true;
      });
  });

  it('saves all new posts to a provider in data store and stores last date', function() {
    var foo = new MockProvider('foo');
    foo.addPosts(10, moment.unix(0));

    var feed = new MockFeed([foo]);

    var dataStore = new MockDataStore(feed);

    foo.addPosts(5, moment.unix(100));
    expect(foo._posts.length).to.eql(15);

    return synchronize(feed, dataStore)
      .then(function(lastFeedDates) {
        expect(foo._lastPostDate.isSame(lastFeedDates[0])).to.be.true;
        expect(foo._lastPostDate.isSame(dataStore._lastDateForProvider(foo)));
        expect(dataStore._postsForProvider(foo)).to.eql(foo._posts);
      });
  });

  it('adds missing posts to a feed in data store and stores last dates', function() {
    var foo = new MockProvider('foo');
    foo.addPosts(10, moment.unix(0));

    var bar = new MockProvider('bar');
    bar.addPosts(10, moment.unix(1));

    var feed = new MockFeed([foo, bar]);

    var dataStore = new MockDataStore(feed);

    foo.addPosts(5, moment.unix(110));
    bar.addPosts(5, moment.unix(151));

    return synchronize(feed, dataStore)
      .then(function(lastFeedDates) {
        expect(lastFeedDates[0]).to.eql(foo._lastPostDate);
        expect(lastFeedDates[1]).to.eql(bar._lastPostDate);

        comparePosts(dataStore._postsForFeed(feed), feed._allPosts);
        expect(dataStore._lastDatesForFeed(feed)).to.eql(lastFeedDates);
      });
  });

  it('runs initial sync properly', function() {
    var foo = new MockProvider('foo');
    var bar = new MockProvider('bar');
    var baz = new MockProvider('baz');
    var feed = new MockFeed([foo, bar, baz]);
    var dataStore = new MockDataStore(feed);

    foo.addPosts(5, moment.unix(10));
    bar.addPosts(10, moment.unix(100));

    return synchronize(feed, dataStore)
      .then(function() {
        var lastDates = dataStore._lastDatesForFeed(feed);
        expect(lastDates.length).to.be.eql(3);
        expect(lastDates[0]).to.eql(foo._lastPostDate);
        expect(lastDates[1]).to.eql(bar._lastPostDate);
        expect(lastDates[2]).to.eql(baz._lastPostDate);
        expect(lastDates[2]).to.be.null;
      });
  });

  it('runs properly when only one post is added', function() {
    var foo = new MockProvider('foo');
    foo.addPosts(5, moment.unix(0));

    var bar = new MockProvider('bar');
    bar.addPosts(5, moment.unix(1));

    var feed = new MockFeed([foo, bar]);
    var dataStore = new MockDataStore(feed);

    foo.addPosts(1, moment.unix(1000));

    return synchronize(feed, dataStore)
      .then(function(lastDates) {
        expect(lastDates[0]).to.eql(foo._lastPostDate);
        expect(lastDates[1]).to.eql(bar._lastPostDate);
        comparePosts(dataStore._postsForProvider(foo), foo._posts);
        comparePosts(dataStore._postsForProvider(bar), bar._posts);
        comparePosts(dataStore._postsForFeed(feed), feed._allPosts);
      });
  });

  it('runs properly when there is one empty provider', function() {
    var foo = new MockProvider('foo');
    foo.addPosts(5, moment.unix(0));

    var bar = new MockProvider('bar');

    var feed = new MockFeed([foo, bar]);
    var dataStore = new MockDataStore(feed);

    foo.addPosts(2, moment.unix(1000));

    return synchronize(feed, dataStore)
      .then(function(lastDates) {
        expect(lastDates[0]).to.eql(foo._lastPostDate);
        expect(lastDates[1]).to.eql(bar._lastPostDate);
        comparePosts(dataStore._postsForProvider(foo), foo._posts);
        comparePosts(dataStore._postsForProvider(bar), bar._posts);
        comparePosts(dataStore._postsForFeed(feed), feed._allPosts);
      });
  });

  it('Duplicates should be removed', function() {
    var inst = new MockProvider('instagram');
    inst.addPosts(1, moment("2016-08-01 10:30:00", "YYYY-MM-DD HH:mm:ss"));

    var tw = new MockProvider('twitter');
    tw.addPosts(1, moment("2016-08-01 11:30:00", "YYYY-MM-DD HH:mm:ss"));

    var feed = new MockFeed([inst, tw]);
    var dataStore = new MockDataStore(feed);

    inst.addPosts(1, moment("2016-08-01 11:50:00", "YYYY-MM-DD HH:mm:ss"));
    tw.addPosts(1, moment("2016-08-01 11:50:01", "YYYY-MM-DD HH:mm:ss"));

    inst.addPosts(1, moment("2016-08-01 11:55:00", "YYYY-MM-DD HH:mm:ss"));
    tw.addPosts(1, moment("2016-08-01 11:55:01", "YYYY-MM-DD HH:mm:ss"));


    return synchronize(feed, dataStore)
      .then(function() {
        return expect(dataStore._postsForFeed(feed).length).to.eql(4);
      });
  });

  it('Duplicates should be removed when empty initial data', function() {
    var inst = new MockProvider('instagram');
    var tw = new MockProvider('twitter');

    var feed = new MockFeed([inst, tw]);
    var dataStore = new MockDataStore(feed);

    inst.addPosts(1, moment("2016-08-01 11:50:00", "YYYY-MM-DD HH:mm:ss"));
    tw.addPosts(1, moment("2016-08-01 11:50:01", "YYYY-MM-DD HH:mm:ss"));

    return synchronize(feed, dataStore)
      .then(function() {
        return expect(dataStore._postsForFeed(feed).length).to.eql(1);
      });
  });
});

function comparePosts(p1, p2) {
  function mapPost(post) {
    var time = post.created_time.format();
    var newPost = JSON.parse(JSON.stringify(post));
    newPost.created_time = time;
    return newPost;
  }

  p1 = p1.map(mapPost);
  p2 = p2.map(mapPost);
  expect(p1).to.eql(p2);
}

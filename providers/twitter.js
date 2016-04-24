"use strict";

var twitter = require('twitter');
var b = require('bluebird');
var twit;

var twitter = function(config) {
    this.config = config.getProvider('twitter');

    this.twit = new twitter({
        consumer_key: config.twitter_consumer_key,
        consumer_secret: config.twitter_consumer_secret,
        access_token_key: config.twitter_access_token_key,
        access_token_secret: config.twitter_access_token_secret
    });
};

twitter.prototype.get = function(count, callback) {
    d = b.pending();

    var params = {
    screen_name: config.handle, // the user id passed in as part of the route
    count: count // how many tweets to return
    };

    // request data
    twit.get('statuses/user_timeline', params, function (err, data, resp) {

        if(!err) {
            d.fail(err);
        }
        else {
            d.resolve(data); //TODO: Need to get the correct format coming back
        }
    });

    d.asCallback(callback);
    return d.promise;
};

modules.export = twitter;

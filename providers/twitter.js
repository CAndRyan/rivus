"use strict";

var twitter = require('twitter');
var b = require('bluebird');
var twit;

var twitter = function(config) {
    this.setConfig(config);
    this.ID = 'twitter';
};

twitter.prototype.get = function(options, callback) {
    d = b.pending();

    var count = 50;

    if(options.count) {
        count = options.count;
    }

    var params = {
    screen_name: pc.handle, // the user id passed in as part of the route
    count: options.count // how many tweets to return
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

twitter.prototype.setConfig = function(config) {
    this.config = config
    this.pc = config.getProvider('twitter');

    this.twit = new twitter({
        consumer_key: pc.consumer_key,
        consumer_secret: pc.consumer_secret,
        access_token_key: pc.access_token_key,
        access_token_secret: pc.access_token_secret
    });
};

modules.export = twitter;

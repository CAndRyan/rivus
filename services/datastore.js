'use strict';

var b = require('bluebird');
var moment = require('moment');

var CURRENT_KEY_NAME = 'feed-current';
var MONTHLY_KEY_NAME = 'feed-monthly';

var redis = require('redis');
b.promisifyAll(redis.RedisClient.prototype);
b.promisifyAll(redis.Multi.prototype);

var ds = function(config) {
    this.config = config;

    var dbconf = this.config.datastore.settings;

    this.provider = redis.createClient({
		host: dbconf.host,
		port: dbconf.port,
		password: dbconf.password,
	});
};

ds.prototype.getCurrent = function(callback) {
    var d = b.pending();

    this.provider.get(CURRENT_KEY_NAME).then(function(result) {
        if(!result) {

        }
    }).fail(d.reject);

    d.asCallback(callback);
    return d.promise;
};

ds.prototype.generateCurrent = function(feedItem, callback) {
    var d = b.pending();

    var date = moment(feedItem.pubDate);

    var key = CURRENT_KEY_NAME;

    //TODO: need to go and create the current file with a ttl to expire 

    d.asCallback(callback);
    return d.promise;
};

ds.prototype.getArchive = function(month, callback) {

};

ds.prototype.set = function(feedItem, callback) {
    var d = b.pending();

    var date = moment(feedItem.pubDate);

    var key = MONTHLY_KEY_NAME + "-" + date.month + "-" + date.year;

    this.provider.get(key).then(function(result) {
        var itemExists = false;

        result.forEach(function(r) {
            if(feedItem.url.toLowerCase() == r.url.toLowerCase()) {
                itemExists = true;
            }
        });

        if(!itemExists) {
            result.push(feedItem);

            this.provider.set(key, result).then(d.resolve).fail(d.reject);
        } else {
            d.resolve(null);
        }

    }).fail(function(error) {
        d.reject(error);
    });

    d.asCallback(callback);
    return d.promise;
};



module.exports = ds;

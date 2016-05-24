'use strict';

var b = require('bluebird');

var redis = require('redis');
b.promisifyAll(redis.RedisClient.prototype);
b.promisifyAll(redis.Multi.prototype);

var ds = function(config) {
    this.config = config;

    var dbconf = this.config.datastore.settings;

    this.provider = redis.createClient(dbconf.host, dbconf.port);
};

ds.prototype.get = function(id, callback) {
    var d = b.pending();

    d.asCallback(callback);
    return d.promise;
};

ds.prototype.set = function(id, val, callback) {
    var d = b.pending();

    d.asCallback(callback);
    return d.promise;
};

ds.prototype.list = function(callback) {
    var d = b.pending();

    d.asCallback(callback);
    return d.promise;
};

module.exports = ds;

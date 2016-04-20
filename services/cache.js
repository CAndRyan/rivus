"use strict";

var cacheManager = require('cache-manager');
var redisStore = require('cache-manager-redis');
var b = require('bluebird');

var cache = function(config) {
    this.config = config;
    this.defaultTTL = 3600;

    this.init(this.config);
};

cache.prototype.init = function(config, callback) {
    var d = b.pending();

    if(config.cache.type == "redis") {
        this.ds = cacheManager.caching({
                	store: redisStore,
                	host: config.cache.host,
                	port: config.cache.port,
                	auth_pass: config.cache.auth_pass,
                	db: config.cache.db,
                	ttl: config.cache.ttl
                });

        d.resolve();
    } else { //default to memory
        this.ds = cacheManager.caching({store: 'memory', max: 100, ttl: 3600});
        d.resolve();
    }

    b.asCallback(callback);
    return d.promise;
};

cache.prototype.get = function(id, callback) {
    var d = b.pending();

    this.ds.get(id, function(data, error) {
        if(error) {
            d.reject(error);
        } else {
            d.resolve(data);
        }
    });

    d.asCallback(callback);
    return d.promise;
};

cache.prototype.set = function(id, obj, ttl, callback) {
    var d = b.pending();

    if(!ttl) {
        ttl = this.defaultTTL;
    }

    this.ds.set(id, obj, {ttl: ttl}, function(data, error) {
        if(error) {
            d.reject(error);
        } else {
            d.resolve(data);
        }
    });

    d.asCallback(callback);
    return d.promise;
};

cache.prototype.delete = function(id, callback) {
    var d = b.pending();

    this.ds.del(id, function(data, error) {
        if(error) {
            d.reject(error);
        } else {
            d.resolve(data);
        }
    });

    d.asCallback(callback);
    return d.promise;
};

cache.prototype.flush = function(callback) {
    var d = b.pending();

    this.init(this.config).then(function() {
        d.resolve();
    });

    d.asCallback(callback);
    return d.promise;
};

cache.prototype.generateKey = function(name, key) {
    return name.toLowerCase().trim() +"::"+ key.toLowerCase().trim();
};

module.exports = cache;

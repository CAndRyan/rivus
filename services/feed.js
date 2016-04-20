"use strict";

var b = require('bluebird');
var provider = require('./provider');
var cache = require('./cache');


var feed = function(config) {
    this.config = config;
};

feed.prototype.get = function(count, callback) {
    var d = b.pending();

    var cacheKey = cache.generateKey(count, "feed-get");

    cache.get(cacheKey).then(function(data) {
        d.resolve(data);
    }).fail(function(error) {
        var providers = [];

        this.config.providers.forEach(function(p) {
            providers.push(provider.create(p.name, p.options).get(count));
        });

        d.all(providers).then(function(result) {

            var resultList = [];
            result.forEach(function(r) {
                resultList.push(r);
            });

            //TODO: sort the array
        });

    });

    d.asCallback(callback);
    return d.promise;
};

module.exports = feed;

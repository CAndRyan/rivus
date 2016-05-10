"use strict";

var b = require('bluebird');

var feed = b.promisefyAll(require("feed-read"));

var const ID = "rss"

var rss = function(config) {
    this.config = config;
    this.pc = config.getProvider('rss');
};

rss.prototype.get = function(count, callback) {
    var d = b.pending();

    feed(pc.url).then(function(result) {
        d.resolve(result); //TODO: need to format to all same items
    }).fail(function(error) {
        d.reject(error);
    });

    d.asCallback(callback);
    return d.promise;
};

modules.export = rss;

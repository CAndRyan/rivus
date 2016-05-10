"use strict";

var b = require('bluebird');

var feed = b.promisefyAll(require("feed-read"));

var const ID = "rss"

var rss = function(config) {
    this.setConfig(config);
};

rss.prototype.get = function(count, callback) {
    var d = b.pending();

    feed(pc.url).then(function(result) {
        d.resolve(result); //TODO: Need to get the correct format coming back
    }).fail(function(error) {
        d.reject(error);
    });

    d.asCallback(callback);
    return d.promise;
};

rss.prototype.setConfig = function(config) {
    this.config = config;
    this.pc = config.getProvider('rss');
};

modules.export = rss;

"use strict";

var b = require('bluebird');

var rss = function(config) {
    this.config = config;
};

rss.prototype.get = function(count, callback) {
    var d = b.pending();

    d.reject(new Error("Not Implemented"));

    return d.promise;
};

modules.export = rss;

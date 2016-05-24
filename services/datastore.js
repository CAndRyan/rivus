'use strict';

var b = require('bluebird');

var ds = function(config) {
    this.config = config;
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

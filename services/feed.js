"use strict";

var b = require('bluebird');

var feed = function() {

};

feed.prototype.get = function(count, callback) {
    var d = b.pending();

    

    d.asCallback(callback);
    return d.promise;
};

module.exports = feed;

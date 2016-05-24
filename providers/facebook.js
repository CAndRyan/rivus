'use strict';

var b = require('bluebird');

var facebook = function(config) {
    this.setConfig(config);
    this.ID = 'facebook';
};

facebook.prototype.get = function(count, callback) {
    var d = b.pending();

    //TODO: put the guts in here

    d.asCallback(callback);
    return d.promise;
};

facebook.prototype.setConfig = function(config) {
    this.config = config;
    this.pc = config.getProvider('facebook');
};

modules.export = facebook;

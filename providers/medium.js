'use strict';

var b = require('bluebird');

var medium = function(config) {
    this.setConfig(config);
    this.ID = 'medium';
};

medium.prototype.get = function(count, callback) {
    var d = b.pending();

    //TODO: put the guts in here

    d.asCallback(callback);
    return d.promise;
};

medium.prototype.setConfig = function(config) {
    this.config = config;
    this.pc = config.getProvider('medium');
};

modules.export = medium;

'use strict';

var b = require('bluebird');

var linkedin = function(config) {
    this.setConfig(config);
    this.ID = 'linkedin';
};

linkedin.prototype.get = function(count, callback) {
    var d = b.pending();

    //TODO: put the guts in here

    d.asCallback(callback);
    return d.promise;
};

linkedin.prototype.setConfig = function(config) {
    this.config = config;
    this.pc = config.getProvider('linkedin');
};

modules.export = linkedin;

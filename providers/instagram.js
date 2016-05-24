'use strict';

var b = require('bluebird');

var  instagram = function(config) {
    this.setConfig(config);
    this.ID = 'instagram';
};

instagram.prototype.get = function(count, callback) {
    var d = b.pending();

    //TODO: put the guts in here

    d.asCallback(callback);
    return d.promise;
};

instagram.prototype.setConfig = function(config) {
    this.config = config;
    this.pc = config.getProvider('instagram');
};

modules.export = instagram;

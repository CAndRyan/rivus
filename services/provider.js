"use strict";

var p = function(config) {
    this.config = config;
};

p.prototype.create = function(providerName) {
    try {
        var providerPath = '../../providers/' + providerName;
        var Provider = require(providerPath);

        return new Provider(this.config);
    } catch (error) {
        throw error;
    }
};

module.exports = p;

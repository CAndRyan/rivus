"use strict";

var b = require('bluebird');
var fs = require('fs');

var config = function(param) {

    if(!param) { //then we just default to rivus.json
        this.filePath = 'rivus.json';
    } else if (typeof(param) == "string") {
        this.filePath = param;
    } else if (typeof(param) == "object") {
        this.data = param;
    }
/*
    if(this.filePath) {
        this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
    }
*/

};

config.prototype.get = function() {
    return this.data;
};

config.prototype.getProvider = function(name) {

    this.data.providers.forEach(function(provider) {
        if(provider.name.toLowerCase() == name.toLowerCase()) {
            return provider;
        }
    });

    return null;
};

module.exports = config;

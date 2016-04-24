"use strict";

var b = require('bluebird');
var fs = b.promisifyAll(require('fs'));

var config = function(param) {

    if(!param) { //then we just default to rivus.json
        this.filePath = 'rivus.json';
    } else if (typeof(param) == "string") {
        this.filePath = param;
    } else if (typeof(param) == "object") {
        this.data = param;
    }

    if(!this.filePath) {
        fs.readFile(this.filePath, 'utf8').then(function(result) {
            this.data = JSON.parse(result);
        });
    }
};

config.prototype.getProvider = function(name) {

    this.data.providers.forEach(function(provider) {
        if(provider.name == name) {
            return provider;
        }
    });

    return null;
};

module.exports = config;

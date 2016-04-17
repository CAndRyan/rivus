"use strict";

(function() {
    var dataStore = require("./services/dataStore"),
        Config = require("./services/config"),
        Cache = require("./services/cache"),
        Feed = require("./services/feed");

    var fons = function() {
        this.dataStore = new DataStore();
        this.config = new Config();
        this.cache = new Cache();
        this.feed = new Feed();

        //TODO: Addin in global functions
    };
    module.exports = fons;
}).call(this);

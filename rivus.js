"use strict";

(function() {
    var DataStore = require("./services/dataStore"),
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

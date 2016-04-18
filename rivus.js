"use strict";

(function() {
    var DataStore = require("./services/dataStore"),
        Config = require("./services/config"),
        Cache = require("./services/cache"),
        Feed = require("./services/feed");

    var fons = function(config) {

        this.config = new Config(this.config);

        this.dataStore = new DataStore(this.config);
        this.cache = new Cache(this.config);
        this.feed = new Feed(this.config);

        //TODO: Addin in global functions
    };
    module.exports = fons;
}).call(this);

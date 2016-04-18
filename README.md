# Rivus (http://riv.us)
Social aggregation into a single feed (example: jaredwray.com)

# Features
* Single Feed
* Built in Deduplication
* Caching
* Data Store
* Callback and Promises Supported
* Many Providers

# How To Use Rivus
**Step 1**: Set your the provider configuration file up correctly to support what providers you want to use and the settings / authentication needed.
**Step 2**: Do the following code to get the feed results (using promises. Note that callbacks are also supported):
```javascript
    var Rivus = require("riv.us");

    var rivus = new Rivus("../path/to/config"); //the config should list the providers and their settings
    rivus.get().then(function(result) {
        console.log(result);
    }).fail(function(error) {
        console.log(error);
    });
```

By default the following is enabled:
* In Memory Caching with a TTL of 3600 (6 Hours)
* Deduplication is enabled by default.

# Standard Feed Result
The standard feed result will look like the following:
```javascript
{
    providerID,
    providerName,
    title,
    description,
    imageUrl,
    dateCreated,
    url
}
```

# Providers
Providers are built with a set of common interfaces so that they can be interchangable. Each provider allows for the following:
* configuration / settings ```setConfig(setting, callback)```: each config can be located in the ```providers/config.json``` configuration file.
* get feed items ```get(options, callback)```: This allows to get the feed items in a normalized look and feel.

Here is a list of providers currently supported:

* Instagram
* Twitter
* RSS
* Atom
* Medium
* Facebook
* Linkedin

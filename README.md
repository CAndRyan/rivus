# Rivus (https://riv.us) [![Circle CI](https://circleci.com/gh/jaredwray/rivus.svg?style=svg&circle-token=a205a8a619b81eb76f74b8bad198065576252fa7)](https://circleci.com/gh/jaredwray/rivus)
Social aggregation into a single feed (example: jaredwray.com)

# Features
* Single Feed
* Built in Deduplication    
* Caching
* Data Store
* Callback and Promises Supported
* Many Providers

# Install

Requires Node.js v0.10 or higher.

**Using NPM**
```
$ npm install riv-us
```

# How To Use Rivus
**Step 1**: Set your the provider configuration file up correctly to support what providers you want to use and the settings / authentication needed.

* Medium: Copy user name from URL https://medium.com/@<your_medium_username.
Put this in the field 'user' in the configuration. To get publication's feed copy the name of publication https ://medium.com/the-story and put it in the field "publication". If feed situated at the custom domain, copy only domain and put it in the field "publication_with_custom_domain".
* RSS: List the URL of the feed you are interested in the field "feed_url".
* Twitter: Create an application at https://apps.twitter.com/app/new. Go into the details of the generated application and find: Consumer Key (API Key), Consumer Secret (API Secret), Access Token, Access Token Secret. Copy these values and your account name @username in the appropriate configuration fields.
* Facebook: Create an application at https://developers.facebook.com/apps Go into the details of the generated application and find App ID and App Secret . Find out your User ID there are many ways to do it. Copy the received information in the appropriate configuration fields.
* Instagram: Copy the name of your account @username and your Access Token in the appropriate configuration fields.

```
{
    "dataStore": {
        "type": "none",
        "settings": {
        }
    },
    "cache": {
        "store": "memory",
        "settings": {
            "ttl": 3600, // seconds
            "max": 25
        }
    },
    "providers": [
        {
            "name": "rss",
            "feed_url": "http://www.example.org/export/articles.rss"
        },
        {
            "name": "instagram",
            "user": "@username",
            "access_token": "1270826243.3574ed0.d2925718be41442e877c9d496b6e1d2a"
        },
        {
            "name": "medium",
            "user": "@username"
        },
        {
            "name": "medium",
            "publication": "blog_title"
        },
        {
            "name": "medium",
            "publication_with_custom_domain": "http://www.example.org"
        },
        {
            "name": "twitter",
            "user": "@username",
            "consumer_key": "dwO2Ye2v4hVVG9nPOuKVjKzDN",
            "consumer_secret": "wAbDbmxFKgBpdxiyzAIlSe5i8X3UyMP6N5OtBpCpVBEUrXQbw2",
            "access_token_key": "1234567892-q3ztVafxE9O9U0yWNkapcrAWJeuKW7Jw67Bu88k",
            "access_token_secret": "WQhEraiTcbJ4Nq2sqk5lnOWGdKBasOB5201smsoX17aSR"
        },
        {
            "name": "facebook",
            "app_id": "wAbDbmxFKgBpdxiyzAIlSe5i8X3UyMP6N5OtBpCpVBEUrXQbw2",
            "app_secret": "dwO2Ye2v4hVVG9nPOuKVjKzDN",
            "user_id": "userid"
        }
    ]
}
```
**Step 2**: Do the following code to get the feed results (using promises. Note that callback are also supported):
```javascript
    var Rivus = require("riv-us");

    var rivus = new Rivus(__dirname + "../path/to/config"); // the config should list the providers and their settings

    // or with object
    var rivus = new Rivus({...});

    // using promises
    rivus.get().then(function(result) {
        console.log(result);
    }).catch(function(error) {
        console.log(error);
    });

    // or using callback
    rivus.get(function (err, result) {
        console.log(err, result);
    });

    // or using callback and count
    rivus.get(10, function (err, result) {
        console.log(err, result);
    });

```

By default the following is enabled:
* In Memory Caching with a TTL of 3600 (1 Hour)
* Deduplication is enabled by default.

**Environment variables**: Rivus can use environment variables. It should include environment-specific values such as API keys.
```
{
    "name": "facebook",
    "app_id": "process.env.DEV.app_id",
    "app_secret": "process.env.DEV.app_secret",
    "user_id": "userid"
}
```
**Date display**: Moment.js allows you to easily manipulate created time.
```
rivus.get(function (err, result) {
    result[0].created_time.format('dddd'); // Wednesday
});

```
**Redis cache**: Example of config caching using Redis.
```
"cache": {
    "store": "redis",
    "settings": {
        "ttl": 3600,
        "host": "localhost",
        "port": 6379,
        "auth_pass": "",
        "db": 0,
    }
}

```
**Multi cache**: Example of config using Multi cache.
```
"cache": [
    {
      "store": "memory",
      "settings": {
        "ttl": 3600
      }
    },
    {
      "store": "redis",
      "ttl": 3600
    }
]

```

# Standard Feed Result
The standard feed result will look like the following:
```javascript
{
  title: '',
  content: '',
  created_time: {}, // Moment object - http://momentjs.com/
  images: {
    thumbnail: {url: ''},
    content: {url: ''} // optional
  },
  link: "",
  extra: {}, // original feed
  source: {
    name: '', // provider name
    feed: '' // feed id
  }
}
```

# Providers
Providers are built with a set of common interfaces so that they can be interchangable. Each provider allows for the following:
* ID: is required for every provider and it cannot be the same as another. This is done as a constant such as ```id = 'providerID'```
* configuration / settings at the creation of the service ```var obj = new Provider(config);``` : each config can be located in the ```/config.json``` configuration file under the ```providers:``` array.
* get(): get feed items ```get(count)```: This allows to get the feed items in a normalized look and feel.

Here is a list of providers currently supported:

* Instagram
* Twitter
* RSS
* Medium
* Facebook

# Tests
Tests for Rivus can be run using the command:
```
gulp test
```

# TODO
* More providers
* Tests

# Authors
Jared Wray [jaredwray.com](http://jaredwray.com)

# Licence
Apache 2.0

# Issues
Issues? Feature Requests? reported an [issue](https://github.com/jaredwray/rivus/issues).

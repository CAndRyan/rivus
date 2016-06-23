'use strict';

var url = require('url');

var Rss = require('./rss');

function createRssConfig(mediumConfig) {
  if (mediumConfig.user) {
    return {
      name: 'medium-user:' + mediumConfig.user,
      feed_url: 'https://medium.com/feed/' + mediumConfig.user
    };
  } else if (mediumConfig.publication) {
    return {
      name: 'medium-publication:' + mediumConfig.publication,
      feed_url: 'https://medium.com/feed/' + mediumConfig.publication
    };
  } else if (mediumConfig.publication_with_custom_domain) {
    var customDomainUrl = url.parse(mediumConfig.publication_with_custom_domain);
    customDomainUrl.pathname = '/feed';

    return {
      name: 'medium:' + customDomainUrl.hostname,
      feed_url: customDomainUrl.format()
    };
  }
  
  throw new Error('medium provider: config is invalid');
}

function MediumProvider(providerConfig) {
  this._rss = new Rss(createRssConfig(providerConfig));
}

MediumProvider.prototype.get = function getMediumFeed() {
  return this._rss.get.apply(this._rss, arguments);
};

MediumProvider.prototype.verifyConfig = function verifyMediumConfig(config) {
  if (config.user && !/^@/.exec(config.user)) {
    return new Error('medium provider: user name should start with a @');
  }

  if (config.publication_with_custom_domain) {
    try {
      var domainUrl = url.parse(config.publication_with_custom_domain);
      if (!domainUrl.host) {
        return new Error('medium provider: publication_with_custom_domain must have a valid domain');
      }
    } catch (e) {
      return new Error('medium provider: publication_with_custom_domain must have a valid domain');
    }
  }

  if (!config.user && !config.publication && !config.publication_with_custom_domain) {
    return new Error('medium provider: one of `user`, `publication` or `publication_with_custom_domain` must be given');
  }

  return null;
};

module.exports = MediumProvider;

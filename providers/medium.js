'use strict';

var url = require('url');

var Rss = require('./rss');

function MediumProvider(providerConfig) {
  this._rss = new Rss(createRssConfig(providerConfig));
}

MediumProvider.prototype.get = function getMediumFeed() {
  return this._rss.get.apply(this._rss, arguments);
};

MediumProvider.verifyConfig = function verifyMediumConfig(config) {
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

function createRssConfig(mediumConfig) {
  if (mediumConfig.user) {
    return {
      name: mediumConfig.name,
      feed_url: 'https://medium.com/feed/' + mediumConfig.user,
      id: feedId(mediumConfig.name, 'user', mediumConfig.user)
    };
  } else if (mediumConfig.publication) {
    return {
      name: mediumConfig.name,
      feed_url: 'https://medium.com/feed/' + mediumConfig.publication,
      id: feedId(mediumConfig.name, 'publication', mediumConfig.publication)
    };
  } else if (mediumConfig.publication_with_custom_domain) {
    var customDomainUrl = url.parse(mediumConfig.publication_with_custom_domain);
    customDomainUrl.pathname = '/feed';

    return {
      name: mediumConfig.name,
      feed_url: customDomainUrl.format(),
      id: feedId(mediumConfig.name, 'publication_with_custom_domain', mediumConfig.publication_with_custom_domain)
    };
  }
  throw new Error('medium provider: config is invalid');
}

function feedId(name, type, id) {
  return name + ':' + type + ':' + id;
}

module.exports = MediumProvider;

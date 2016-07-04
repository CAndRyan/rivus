'use strict';

function providerSourceFileFromName(providerName) {
  return '../providers/' + providerName;
}

function requireProvider(providerName) {
  return require(providerSourceFileFromName(providerName));
}

function Provider() {
  throw new Error('providers should be instantiated by calling Provider.create');
}

Provider.create = function createProvider(providerConfig) {
  var providerName = providerConfig.name;
  try {
    var ProviderClass = requireProvider(providerName);
    return new ProviderClass(providerConfig);
  } catch (e) {
    throw new Error('provider not included: ' + providerName);
  }
};

Provider.exists = function providerExists(providerName) {
  try {
    require.resolve(providerSourceFileFromName(providerName));
    return true;
  } catch (e) {
    return false;
  }
};

Provider.verifyConfig = function verifyProviderConfig(config) {
  if (!Provider.exists(config.name)) {
    throw new Error('provider module `' + config.name + '` not installed');
  }

  var ProviderClass = requireProvider(config.name);

  if (ProviderClass.verifyConfig) {
    return ProviderClass.verifyConfig(config);
  }
  
  return null;
};

module.exports = Provider;

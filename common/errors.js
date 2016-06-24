function ConfigError(message, configSource) {
  this.name = 'ConfigError';
  this.message = message;
  this.source = configSource;
}
ConfigError.prototype = new Error();
ConfigError.prototype.constructor = ConfigError;


function FeedRequestError(providerName, feedId, message, extra) {
  this.name = 'FeedRequestError';
  this.feed = {
    provider: providerName,
    id: feedId
  };
  this.message = message;
  this.extra = extra;
}
FeedRequestError.prototype = new Error();
FeedRequestError.prototype.constructor = FeedRequestError;


module.exports = {
  ConfigError: ConfigError,
  FeedRequestError: FeedRequestError
};

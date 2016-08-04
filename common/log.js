var winston = require('winston');

module.exports = winston.loggers.add('rivus', {
  console: {
    level: 'info',
    colorize: true,
    timestamp: true,
    prettyPrint: true,
    humanReadableUnhandledException: true
  }
});

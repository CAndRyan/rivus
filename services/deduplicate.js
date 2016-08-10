var log = require('../common/log');
var moment = require('moment');

function deduplicate(feeds) {
  return instagramAndTwitter(feeds);
}

function instagramAndTwitter(feeds) {
  var instagram = getFeedsByProvider(feeds, 'instagram');
  var twitter = getFeedsByProvider(feeds, 'twitter');
  var duplicates = [];

  if(!instagram || !twitter || !instagram.length || !twitter.length) return feeds;

  instagram.forEach(function (inst) {
    var dup = [];
    twitter.forEach(function(twi) {
      if(twi.created_time.isSameOrAfter(inst.created_time)
        && twi.created_time.isBefore(moment(inst.created_time).add(3, 'seconds'))){
        dup.push(twi);
      }
    });
    duplicates = duplicates.concat(dup);
  });

  if(duplicates.length) {
    duplicates.forEach(function (item) {
      var idx = feeds.indexOf(item);
      feeds.splice(idx, 1);
    });
  }
  return feeds;
}

function getFeedsByProvider(feeds, provider) {
  return feeds.filter(function (item) {
    return item.source.name === provider;
  });
}

module.exports = deduplicate;

'use strict';

var expect = require('chai').expect;
var nock = require('nock');
var Promise = require('es6-promise').Promise;

describe('providers.facebook', function() {

  describe('response', function() {
    beforeEach(function() {
      this.nock = nock('https://graph.facebook.com');
      this.authenticatedNock = nock('https://graph.facebook.com', {reqheaders: {'access-token': 'app_id|app_secret'}})

      this.accessTokenNock = this.nock
        .get('/oauth/access_token')
        .query({client_id: 'app_id', client_secret: 'app_secret', grant_type: 'client_credentials'})
        .reply(200, function() {
          return 'access_token=app_id|app_secret';
        });

      this.feedNock = this.authenticatedNock
        .get('/12345/feed')
        .query({fields: 'message,link,message_tags,name,picture,full_picture,type,created_time,source,story_tags'})
        .replyWithFile(200, __dirname + '/replies/facebook.json');

      this.facebook = new (require('../providers/facebook'))({
        name: 'facebook',
        user_id: '12345',
        app_id: 'app_id',
        app_secret: 'app_secret'
      });
    });

    it('should return a promise', function() {
      expect(this.facebook.get(5)).to.be.an.instanceOf(Promise);
    });

    it('should return an array of 25 items', function() {
      return this.facebook.get(5).then(function(response) {
        expect(response).to.be.an('array');
        expect(response.length).to.eql(25);
      });
    });
  });

  it('should have a facebook provider that is not undefined', function() {
    var Facebook = require('../providers/facebook');
    expect(Facebook).to.exist;
  });

  it('should have a proper feed id', function() {
    var facebook = new (require('../providers/facebook'))({
      name: 'facebook',
      user_id: '12345',
      app_id: 'app_id',
      app_secret: 'app_secret'
    });

    expect(facebook.feedId).to.eql('facebook:user:12345');
  });
});


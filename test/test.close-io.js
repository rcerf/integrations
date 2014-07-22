var auth         = require('./auth')
  , facade       = require('segmentio-facade')
  , helpers      = require('./helpers')
  , integrations = require('..')
  , should       = require('should');

var close    = new integrations['Close.io']()
  , settings = auth['Close.io'];


describe('Close.io', function () {

  describe('.enabled()', function () {
    var Track = facade.Track;
    it('should require a userId', function () {
      close.enabled(new Track({
        channel : 'server'
      })).should.not.be.ok;

      close.enabled(new Track({
        userId: 'test@segment.io',
        channel: 'server'
      })).should.be.ok;
    });

    it('should only be enabled for all messages with email', function () {
      close.enabled(new Track({
        userId: 'test@segment.io',
        channel: 'server'
      })).should.be.ok;

      close.enabled(new Track({
        userId: 'sss',
        channel: 'server'
      })).should.not.be.ok;
    });

    it('should only be enabled for server side messages', function () {
      close.enabled(new Track({
        userId: 'test@segment.io',
        channel: 'server'
      })).should.be.ok;

      close.enabled(new Track({
        userId: 'test@segment.io',
        channel: 'client'
      })).should.not.be.ok;

      close.enabled(new Track({
        userId: 'test@segment.io'
      })).should.not.be.ok;
    });
  });

  describe('.validate()', function () {
    it('should require an apiKey', function () {
      close.validate({}, { apiKey : '' }).should.be.an.instanceOf(Error);
      close.validate({}, {}).should.be.an.instanceOf(Error);
      should.not.exist(close.validate({}, { apiKey : 'xxx' }));
    });
  });

  describe('.identify()', function () {
    var identify = helpers.identify()
      , filter   = { email : identify.email() };

    it('should get a good response from the API', function (done) {
      close.identify(identify, settings, done);
    });

    it('should be able to identify a new user', function (done) {
      close.identify(identify, settings, function(err, res){
        if (err) return done(err);
        res.body.item.emails[0].value.should.eql(identify.email());
        done();
      });
    });

    it('should be able to identify an existing user', function (done) {
      var identify = helpers.identify({ email: 'jakecerf@gmail.com' });
      close.identify(identify, settings, done);
    });
  });

  describe('track()', function () {
    it('should get a good response from the API', function (done) {
      var track = helpers.track();
      close.track(track, settings, done);
    });

    it('will error on an invalid set of keys', function (done) {
      var track = helpers.track();
      close.track(track, { apiKey: 'x'}, function (err) {
        should.exist(err);
        err.status.should.eql(401);
        done();
      });
    });
  });
});


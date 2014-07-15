var auth         = require('./auth')
  , facade       = require('segmentio-facade')
  , helpers      = require('./helpers')
  , integrations = require('..')
  , should       = require('should');

console.log("Integrations: ", integrations['Close.io']);
var close    = new integrations['Close.io']()
  , settings = auth['Close.io'];


describe('Close.io', function () {
  describe('.validate()', function () {
    it('should require an apiKey', function () {
      close.validate({}, { apiKey : '' }).should.be.an.instanceOf(Error);
      close.validate({}, {}).should.be.an.instanceOf(Error);
      should.not.exist(close.validate({}, { apiKey : 'xxx' }));
    });
  });

  describe('.validate()', function () {
    it('should require an apiKey', function () {
      close.validate({}, { apiKey: ''}).should.be.an.instanceOf(Error);
      close.validate({}, {}).should.be.an.instanceOf(Error);
      should.not.exist(close.validate({}, { apiKey: 'xxx'}));
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


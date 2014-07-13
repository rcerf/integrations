var auth         = require('./auth')
  , facade       = require('segmentio-facade')
  , helpers      = require('./helpers')
  , integrations = require('..')
  , should       = require('should');


var close = new integrations['Close.io']()
  , settings = auth['Close.io'];


describe('Close IO', function () {

  describe('.enabled()', function () {
    var Track = facade.Track;
    it('should only be enabled for server side messages', function () {
      close.enabled(new Track({ channel : 'server' })).should.be.ok;
      close.enabled(new Track({ channel : 'client' })).should.not.be.ok;
      close.enabled(new Track({})).should.not.be.ok;
    });
  });
});


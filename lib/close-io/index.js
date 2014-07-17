
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var fmt = require('util').format;
var mapper = require('./mapper');
var BadRequest = integration.errors.BadRequest;

/**
 * Expose `Close IO`
 */

var Close = module.exports = integration('Close.io')
  .endpoint('https://app.close.io/api/v1')
  .channel('server')
  .mapper(mapper)
  .retries(2);


/**
 * Enabled.
 *
 * @param {Facade} message
 * @param {Object} settings
 * @return {Boolean}
 * @api public
 */

Close.prototype.enabled = function(message, settings){
  return  message.enabled(this.name)
    && !!message.userId
    && !!message.userId()
    && 'server'=== message.channel()
    && !!message.email
    && !!message.email();
};

/**
 * Validate.
 *
 * @param {Facade} message
 * @param {Object} settings
 * @return {Error}
 * @api public
 */
Close.prototype.validate = function(message, settings){
  return this.ensure(settings.apiKey, 'apiKey');
};

/**
 * Track.
 *
 * http://developer.close.io/#Activities
 *
 * @param {Track} payload
 * @param {Object} settings
 * @param {Function} fn
 * @api public
 */

Close.prototype.track = function (payload, settings, fn) {
  return this
    .post('/activity/note')
    .type('json')
    .set(headers(settings))
    .send(payload)
    .end(this.handle(fn));
};

/**
 * Add the headers to the request
 *
 * @param {Object} settings
 * @return {Object}
 */

function headers (settings) {
  return {
    'User-Agent': 'Segment.io/1.0',
    'Api-Key': settings.apiKey
  };
}

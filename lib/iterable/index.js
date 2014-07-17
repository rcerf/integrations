
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var mapper = require('./mapper');

/**
 * Expose `Iterable`
 */

var Iterable = module.exports = integration('Iterable')
  .endpoint('https://api.iterable.com/api')
  .mapper(mapper)
  .retries(2);

/**
 * Enabled. Iterable required that email be present
 *
 * @param {Facade} message
 * @param {Object} settings
 * @return {Boolean}
 * @api public
 */

Iterable.prototype.enabled = function(message, settings){
  return message.enabled(this.name) &&
    !!message.email &&
    !!message.email();
};

/**
 * Validate.
 *
 * @param {Facade} message
 * @param {Object} settings
 * @return {Error}
 * @api public
 */
Iterable.prototype.validate = function(message, settings){
  return this.ensure(settings.apiKey, 'apiKey');
};

/**
 * Track.
 *
 * https://api.iterable.com/api/docs#!/events/track_post_0
 *
 * @param {Track} track
 * @param {Object} settings
 * @param {Function} fn
 * @api public
 */

Iterable.prototype.track = function (payload, settings, fn) {
  return this
    .post('/events/track')
    .type('json')
    .set(headers(settings))
    .send(payload)
    .end(this.handle(fn));
};

/**
 * Identify.
 *
 * https://api.iterable.com/api/docs#!/users/updateUser_post_1
 *
 * @param {Object} payload
 * @param {Object} settings
 * @param {Function} fn
 * @api public
 */

Iterable.prototype.identify = function (payload, settings, fn) {
  return this
    .post('/users/update')
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

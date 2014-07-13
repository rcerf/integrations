
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
  .endpoint('https://app.close.io/api/v1/')
  .mapper(mapper)
  .retries(2);

/**
 * Enabled.
 *
 * @param {Facade} message
 * @return {Boolean}
 * @api public
 */

Close.prototype.enabled = function(message){
  return message.enabled(this.name);
};


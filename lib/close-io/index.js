
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
 * Validate.
 *
 * @param {Facade} message
 * @param {Object} settings
 * @return {Error}
 * @api public
 */

Close.prototype.validate = function(message, settings){
  return this.ensure(settings.projectId, 'projectId')
    || this.ensure(settings.token, 'token');
};


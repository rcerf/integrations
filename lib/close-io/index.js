
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
//var fmt = require('util').format;
var mapper = require('./mapper');
//var BadRequest = integration.errors.BadRequest;

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
Close.prototype.validate = function(_, settings){
  return this.ensure(settings.apiKey, 'apiKey');
};


/**
 * Identify.
 *
 * Identifies a user in Close.io. We first have to check whether a user
 * already exists for this email. If they don't, create them, otherwise
 * update them.
 *
 * http://developer.close.io/#Contact
 *
 * @param {Identify} identify
 * @param {Object} settings
 * @param {Function} fn
 * @api public
 */

Close.prototype.identify = function (identify, settings, callback) {
  var email = identify.email()
    , self  = this;
  this._getLead({ email : email }, settings, function (err, lead) {
    identify.closeLeadId = lead.id;
    identify.closeContId = lead.contacts[0].id;
    if (err) return callback(err);
    if (!lead) self._createUser(identify, settings, callback);
    else self._updateUser(identify, settings, callback);
  });
};

/**
 * Get a user from the API, filtered by particular fields
 *
 * @param  {Object}   filter   an object to match fields on
 * @param  {Object}   settings
 * @param  {Function} callback (err, user)
 * @api private
 */

Close.protoype._getLead = request('GET', '/lead/', {_fields: 'id, contacts'});

/**
 * Updates the Contact in Close.io with the new identify
 *
 * @param  {String}   id        the Close.io Contact  id
 * @param  {Facade}   identify
 * @param  {Object}   settings
 * @param  {Function} callback  (err, user)
 * @api private
 */

Close.prototype._updateUser = request('PUT', '/contact/');

/**
 * Creates a user in Close.io
 *
 * @param {Identify} identify
 * @param {Object} settings
 * @param {Function} fn
 * @api private
 */

Close.prototype._createUser = function(identify, settings, callback){
  var websites = identify.website();
    , self = this;
  getLead(0);
  function getLead(websiteIndex){
    this._getLead({url: websites[websiteIndex]}, settings, function (err, lead){
      identify.closeLeadId = lead.id;
      if (err) return callback(err);
      if (!lead && websiteIndex < websites.length) getLead(websiteIndex++);
      if (!lead)  self._createLead(identify, settings, callback);
      else self._updateLead(identify, settings, callback);
    })
  }
}
Close.prototype._createUser = request('POST', '/contact/');

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

Close.prototype.track = request('POST', '/activity/note/');

/**
 * Add the headers to the request
 *
 * @param {Object} settings
 * @return {Object}
 */

function headers (settings) {
  return {
    'User-Agent': 'Segment.io/1.0',
  };
};

function request(method, path, fields){
  if(method === "GET"){
    return function(payload, settings, fn){
      return this
        .get(path)
        .set(headers(settings))
        .auth(settings.apiKey, '')
        .query(payload)
        .type('json')
        .end(this.handle(function(err, res){
          if (err) return fn(err);
          var items = res.body.items;
          fn(null, items && items[0]);
        }));
    };
  }
  if(method === 'PUT'){
    return function(payload, settings, fn){
      return this
        .put(path + payload.closeId)
        .auth(settings.apiKey, '')
        .type('json')
        .send(formatTraits(payload))
        .end(this.handle(fn));
    };
  };
  if(method === "POST"){
    return function(payload, settings, fn){
      return this
        .post(path)
        .set(headers(settings))
        .auth(settings.apiKey, '')
        .type('json')
        .send(payload)
        .end(this.handle(fn));
    };
  }
}

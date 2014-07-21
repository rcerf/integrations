
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
 * Identifies a Contact in Close.io. We first have to check whether a Contact
 * already exists for this email. If it does update it. Otherwise,
 * check to see if a Lead exists for the user's group. If it does exist,
 * create a new Contact under the lead. Otherwise, create a new Lead and
 * create a new Contact.
 *
 * http://developer.close.io/#Contact
 *
 * @param {Identify} identify
 * @param {Object} settings
 * @param {Function} callback
 * @api public
 */

Close.prototype.identify = function (identify, settings, callback) {
  var email = identify.email()
    , self  = this;
  this._getLead({ query : 'email_address:' +  email }, settings, function (err, lead) {
    console.log('***IDENTIFY LEAD***: ', lead);
    identify.closeLeadId = lead.id;
    identify.closeContId = lead.contacts[0].id;
    if (err) return callback(err);
    if (!lead) self._createContact(identify, settings, callback);
    else self._updateContact(identify, settings, callback);
  });
};

/**
 * Group.
 *
 * Identifies a Lead in Close.io. We first have to check if a
 * Lead already exists for this email. If one does update it.
 * Otherwise, create a new Lead.
 *
 * http://developer.close.io/#Leads
 *
 * @param {Group}    group
 * @param {Object}   settings
 * @param {Function} fn
 * @api public
 */

Close.prototype.group = function (group, settings, fn) {
  var email = group.traits().email
    , self  = this;
  this._getLead({ query : 'email_address:' +  email }, settings, function (err, lead) {
    console.log('***GROUP LEAD***: ', lead);
    group.closeLeadId = lead.id;
    if (err) return fn(err);
    if (!lead) self._createLead(group, settings, fn);
    else self._updateLead(group, settings, fn);
  });
};

/**
 * Get a lead from the API, filtered by particular fields
 *
 * @param  {Object}   filter   an object to match fields on
 * @param  {Object}   settings
 * @param  {Function} fn
 * @api private
 */

Close.protoype._getLead = request('GET', '/lead/');

/**
 * Updates the Lead in Close.io with the new identify
 *
 * @param  {String}            id        the Close.io Lead id
 * TODO: Create a mapper to map identify traits to Lead traits
 * @param  {Group || Identify} group || identify
 * @param  {Object}            settings
 * @param  {Function}          fn
 * @api private
 */

Close.prototype._updateLead = request('PUT', '/lead/');

/**
 * Creates a Lead in Close.io
 *
 * @param {Group || Identify} group || identify
 * @param {Object}            settings
 * @param {Function}          fn
 * @api private
 */

Close.prototype._createLead = request('POST', '/lead/');

/**
 * Updates the Contact in Close.io with the new identify
 *
 * @param  {String}   id        the Close.io Contact id
 * @param  {Facade}   identify
 * @param  {Object}   settings
 * @param  {Function} fn
 * @api private
 */

Close.prototype._updateContact = request('PUT', '/contact/');

/**
 * Creates a Contact in Close.io
 *
 * We first check and see if their is a Lead in Close.io with a URL
 * that contains one of the websites listed under the contact. If there
 * is we use the leadId to create a new Contact as a child of that lead.
 * If not, we create a new Lead and then create a new Contact as a child
 * of that Lead.
 *
 * @param {Identify} identify
 * @param {Object} settings
 * @param {Function} fn
 * @api private
 */

Close.prototype._createContact = function(identify, settings, fn){
  var websites = identify.website();
    , self = this;
  console.log('***WEBSITES***: ', websites);
  if (identify.closeLeadId) return request('POST', '/contact/');
  if (websites.length !== 0 ) getLeadLoop(0);
  else self._createLead(identify, setting, function (err, lead) {
    identify.closeLeadId = lead.id;
    if (err) return fn(err);
    self._createContact(identify, settings, fn);
  });
  function getLeadLoop(websiteIndex){
    this._getLead({query: 'url:' + websites[websiteIndex]}, settings, function (err, lead){
      identify.closeLeadId = lead.id;
      if (err) return fn(err);
      if (!lead && websiteIndex < websites.length) getLeadLoop(websiteIndex++);
      if (!lead)  self._createLead(identify, settings, fn);
      self._createContact(identify, settings, fn);
    })
  }
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

function request(method, path){
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

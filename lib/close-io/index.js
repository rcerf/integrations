
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var mapper = require('./mapper');
var isEmail = require('isemail');

/**
 * Expose `CloseIO IO`
 */

var CloseIO = module.exports = integration('Close.io')
  .endpoint('https://app.close.io/api/v1')
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
CloseIO.prototype.validate = function(_, settings){
  return this.ensure(settings.apiKey, 'apiKey');
};

/**
 * Identify a Contact in Close.io.
 *
 * We first have to check whether a Contact already exists for this
 * email. If it does update it. Otherwise, check to see if a Lead
 * exists for the user's group. If it does exist, create a new Contact
 * under the lead. Otherwise, create a new Lead and create a new Contact.
 *
 * http://developer.close.io/#Contact
 *
 * @param {Identify} identify
 * @param {Object} settings
 * @param {Function} callback
 * @api public
 */

CloseIO.prototype.identify = function (identify, settings, callback) {
  var email = identify.emails[0].email
    , self  = this
    , contactId;
  // email is used as key because user id can not be stored in Close.io
    if(!isEmail(email)) return callback(new Error('email is required'));
    this._getLead({ query : 'email_address:' +  email }, settings, function (err, lead) {
      if (err) return callback(err);
      if (!lead) {
        self._createContact(identify, settings, callback);
      } else {
        lead.contacts.forEach(function(contact){
          if(contact.emails.some(findEmail)) {
            contactId = contact.id;
          }
      });
      function findEmail(contactEmail){
        return contactEmail.email === email;
      }
      delete identify.custom;
      delete identify.date_created;
      self._updateContact(identify, settings, callback, contactId)
    };
  });
};

/**
 * Identifies a Lead in Close.io.
 *
 * We first have to check if a Lead already exists for this email.
 * If one does update it. Otherwise, create a new Lead.
 *
 * http://developer.close.io/#Leads
 *
 * @param {Group}    group
 * @param {Object}   settings
 * @param {Function} fn
 * @api public
 */

CloseIO.prototype.group = function (group, settings, fn) {
  var email = group.contacts[0].emails[0].email
    , self  = this;
  // email is used as key because user id can not be stored in Close.io
  if(!isEmail(email)) return callback(new Error('email is required'));
  this._getLead({ query : 'email_address:' +  email }, settings, function (err, lead) {
    if (err) return fn(err);
    if (!lead) self._createLead(group, settings, fn);
    else {
      var leadId = lead.id;
      self._updateLead(group, settings, fn, leadId);
    };
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

CloseIO.prototype._getContact = request('/contact/');

/**
 * Get a lead from the API, filtered by particular fields
 *
 * @param  {Object}   filter   an object to match fields on
 * @param  {Object}   settings
 * @param  {Function} fn
 * @api private
 */

CloseIO.prototype._getLead = request('/lead/');

/**
 * Updates the Lead in Close.io with the new identify
 *
 * @param  {String}            id        the Close.io Lead id
 * @param  {Group || Identify} group || identify
 * @param  {Object}            settings
 * @param  {Function}          fn
 * @api private
 */

CloseIO.prototype._updateLead = update('/lead/');

/**
 * Creates a Lead in Close.io
 *
 * @param {Group || Identify} group || identify
 * @param {Object}            settings
 * @param {Function}          fn
 * @api private
 */

CloseIO.prototype._createLead = create('/lead/');

/**
 * Updates the Contact in Close.io with the new identify
 *
 * @param  {String}   id        the Close.io Contact id
 * @param  {Facade}   identify
 * @param  {Object}   settings
 * @param  {Function} fn
 * @api private
 */

CloseIO.prototype._updateContact = update('/contact/');

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

CloseIO.prototype._createContact = function(identify, settings, fn, leadId){
  var self = this;
  if (!!leadId) {
    delete identify.custom;
    update('/contact/');
  }else if (!!identify.custom) {
    var company = identify.custom.company;
    this._getLead({query: 'company:' +'\"'+ company + '\"'}, settings, function (err, lead){
      if (err) return fn(err);
      if (lead) {
        leadId = lead.id;
        self._createContact(identify, settings, fn, leadId)
      } else{
        self._createLead(toLead(identify), settings, function (err, lead) {
          leadId = lead.id;
          if (err) return fn(err);
          self._createContact(identify, settings, fn, leadId);
        });
      }
    });
  }else{
    self._createLead(toLead(identify), settings, function (err, lead) {
      var leadId = lead.id;
      if (err) return fn(err);
      self._createContact(identify, settings, fn, leadId);
    });
  }
};

/**
 * Tracks an event as a note in Close.io.
 *
 * Notes are a type of Close.io Activity, which
 * are children of the Lead object.
 *
 * http://developer.close.io/#Activities
 *
 * @param {Track} payload
 * @param {Object} settings
 * @param {Function} fn
 * @api public
 */

CloseIO.prototype.track = function(track, settings, fn){
  var self = this;
  var email = track.email;
  // email is used as key because user id can not be stored in Close.io
  if(!isEmail(email)) return callback(new Error('email is required'));
  self._getLead(track, settings, function(err, lead){
    if (err) return fn(err);
    if (lead) {
      track.lead_id = lead.id;
      self._createNote(track, settings, fn);
    }
    fn();
  });
};

/**
 * Creates a Note in Close.io.
 *
 * http://developer.close.io/#Activities
 *
 * @param {Track} payload
 * @param {Object} settings
 * @param {Function} fn
 * @api public
 */
CloseIO.prototype._createNote = create('/activity/note/');

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

/**
 * Sends GET request using SuperAgent.
 *
 * @param {String} path
 * @return {Object}
 */

function request(path){
  return function(payload, settings, fn){
    return this
      .get(path)
      .set(headers(settings))
      .auth(settings.apiKey, '')
      .query(payload)
      .type('json')
      .end(this.handle(function(err, res){
        if (err) return fn(err);
        var items = res.body.data[0];
        fn(null, items);
      }));
  };
};

/**
 * Sends PUT request using SuperAgent.
 *
 * @param {String} path
 * @return {Object}
 */

function update(path){
  return function(payload, settings, fn, id){
    if(!id) id = '';
    else id = id +'/';
    return this
      .put(path + id)
      .auth(settings.apiKey, '')
      .type('json')
      .send(payload)
      .end(this.handle(function(err, res){
        if (err) return fn(err);
        var items = res.body;
        fn(null, items);
      }));
  };
};

/**
 * Sends POST request using SuperAgent.
 *
 * @param {String} path
 * @return {Object}
 */

function create(path){
  return function(payload, settings, fn){
    return this
      .post(path)
      .set(headers(settings))
      .auth(settings.apiKey, '')
      .type('json')
      .send(payload)
      .end(this.handle(function(err, res){
        if (err) return fn(err);
        var items = res.body;
        fn(null, items);
      }));
  };
};

/**
 * Transforms a Contact to Lead.
 *
 * @param {Object} Contact
 * @return {Object}
 */

function toLead(identify){
  return {
    name: identify.custom.company
  };
}


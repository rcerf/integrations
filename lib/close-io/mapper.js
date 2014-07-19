/**
 * Module dependencies
 */
var unixTime = require('unix-time')

/**
 * Map `track`
 *
 * @param {Track} track
 * @return {Object}
 * @api private
 */

exports.track = function(track){
  var props = track.properties();
  return {
  //TODO: need the lead_id
    lead_id: "lead_EvBok1ynKe4yXxO0UQ8MtbMyKulkdIT1hLFN3caNwvt",
    created_at: track.timestamp().toISOString(),
    note: track.event()
  };
};

/**
 * Map `identify`.
 *
 * @param {Identify} track
 * @return {Object}
 * @api private
 */

//exports.identify = function(identify){
//var traits = identify.traits();
//var created = identify.created();
  //if (created) traits.met = created.toISOString();
  //return {
    //email: identify.email(),
    //dataFields: traits
  //};
//};

/**
 * Map identify.
 *
 * @param {Identify} identify
 * @param {Object} settings
 * @return {Object}
 * @api private
 */

//exports.identify = function(identify, settings){
  //var payload = {
    //address: identify.address(),
    //created: time(identify.created()),
    //duplicates: false,
    //email: identify.email(),
    //user_ip: identify.ip(),
    //city: identify.proxy('traits.city'),
    //state: identify.proxy('traits.state'),
    //website: identify.website(),
    //phone: identify.phone(),
    //name: identify.name(),
    //first_name: identify.firstName(),
    //last_name: identify.lastName(),
    //user_agent: identify.userAgent(),
    //delivery_method: settings.deliveryMethod
  //};
  //return clean(payload);
//};

/**
 * Remove all the non-null and undefined keys from `obj`
 *
 * @param {Object} obj
 * @return {Object} ret
 */

function clean(obj){
  var ret = {};
  Object.keys(obj).forEach(function(key){
    if (obj[key] != null) ret[key] = obj[key];
  });
  return ret;
}

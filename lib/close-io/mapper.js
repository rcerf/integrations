/**
 * Module dependencies
 */

/**
 * Map identify.
 *
 * @param {Identify} identify
 * @param {Object} settings
 * @return {Object}
 * @api private
 */

exports.identify = function(identify, settings){
  console.log('++++++++++MAPPER++++++++++')
  var payload = {
    addresses: identify.address(),
    name: identify.name(),
    title: identify.proxy('traits.title'),
    date_created: identify.created().toISOString(),
    //TODO: Push new email to array rather than replace
    emails: [{email: identify.email()}],
    phones: [{phone: identify.phone()}],
    urls: [{url: identify.proxy('traits.website')}],
    custom: {company: identify.proxy('traits.company')}
  };
  return clean(payload);
};

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

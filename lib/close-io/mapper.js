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
  var payload = {
    addresses: identify.address(),
    name: identify.name(),
    title: identify.proxy('traits.title'),
    date_created: identify.created().toISOString(),
    custom: {company: identify.proxy('traits.company')}
  };
  //TODO: Push new email to array rather than replace
  if (!!identify.email()) payload.emails = [{email: identify.email(), type: 'office'}];
  if (!!identify.phone()) payload.phones = [{phone: identify.phone(), type: 'office'}];
  if (!!identify.proxy('traits.website')) payload.urls = [{url: identify.proxy('traits.company')}];
  return clean(payload);
};

/**
 * Map group.
 *
 * @param {Group} group
 * @param {Object} settings
 * @return {Object}
 * @api private
 */

exports.group = function(group, settings){
  var payload = {
    name: group.traits().name,
    date_created: group.traits().created,
    url: group.traits().website
  };
  if (!!group.traits().address) payload.adresses = group.traits().address;
  if (!!group.traits().email) payload.contacts = [{emails: [{type: 'office', email: group.traits().email}]}];
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
    email: track.email(),
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

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
  console.log('EXPORTS TRACK: ', track, "\n");
  var props = track.properties();
  return {
    lead_id: "lead_T1zxuwitM9x9tQKdnNpyYYnjWxLHAVucOuSmaJx6hL2",  //TODO: need the lead_id
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

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
  console.log('TRACK: ', track);
  var props = track.properties();
  return {
    lead_id: null,  //TODO: need the lead_id
    created_at: unixTime(track.timestamp()),
    note: track.event()
  };
};

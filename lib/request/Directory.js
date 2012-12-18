/**
 * This class manages directory requests.
 *
 * @author Philipp Kemmeter
 */
var Base = require('./Base.js'),
    http = require('http'),
    util = require('util'),
    FW = require('../FW/');

/**
 * Creates a new directory object.
 *
 * @param object session       Session data object.
 * @param LogClient log_client Client for logging.
 * @param RespMan resp_manager Response mananger.
 */
var Directory = function(session, log_client, resp_manager) {
    Base.call(this, session, log_client, resp_manager);
};

util.inherits(Directory, Base);
module.exports = Directory;

/**
 * Handles request to directory to be delivered.
 *
 * @param String filename          Request path and filename.
 * @param String method            The method (POST or GET etc).
 * @param object data              Statics won't receive any params.
 * @param http.ServerResponse resp Server response Object. Write your data into
 *                                 this object directly.
 */
Directory.prototype.run = function(filename, method, data, resp) {
    FW.ValueChecker.string(filename, 'filename', true);
    FW.ValueChecker.instance_of(resp, 'resp', http.ServerResponse);
    this.getResponseManager().writeForbidden(resp);
};

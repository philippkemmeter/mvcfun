/**
 * Abstrakte Basisklassse von Request-Managern.
 *
 * @author Philipp Kemmeter
 */
var http = require('http'),
    util = require('util'),
    FW = require('../FW/'),
    Config = require('../Config.js'),
    RespMan = require('../response/Manager.js');
    LogClient = require('../LogClient.js');


/**
 * Contructor is meant to be abstract!
 *
 * @param object session       Session data object.
 * @param LogClient log_client Client for logging.
 * @param RespMan resp_manager Response mananger.
 */
var Base = function(session, log_client, resp_manager) {
    this._session = session;
    this._log_client = FW.ValueChecker.instance_of(
        log_client, 'log_client', LogClient
    );
    this._resp_manager = FW.ValueChecker.instance_of(
        resp_manager, 'resp_manager', RespMan
    );
};

module.exports = Base;

/**
 * Logs the message via the log client.
 *
 * @param string message Message to log
 */
Base.prototype.log = function(message) {
    this._log_client.log(message);
};

/**
 * Sets the session object.
 *
 * @param object session Session.
 */
Base.prototype.setSession = function(session) {
    this._session = session;
};

/**
 * Returns the session object.
 *
 * @return object
 */
Base.prototype.getSession = function() {
    return this._session;
};

/**
 * Returns the response manager.
 *
 * @return RespMan
 */
Base.prototype.getResponseManager = function() {
    return this._resp_manager;
};

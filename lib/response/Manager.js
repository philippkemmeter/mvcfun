/**
 * Handler with response wrappers.
 *
 * @author Philipp Kemmeter
 */
var http = require('http'),
    FW = require('../FW/'),
    HTTPStatusCodes = require('../HTTPStatusCodes.js');
    LogClient = require('../LogClient.js');

var Manager = function(log_client) {
    this._log_client = FW.ValueChecker.instance_of(
        log_client, 'log_client', LogClient
    );
};

module.exports = Manager;

/**
 * Logs the message via the log client.
 *
 * @param string message Message to log
 */
Manager.prototype.log = function(message) {
    this._log_client.log(message);
};

/**
 * Writes HTML to the response object.
 *
 * @param http.ServerResponse resp Reponse Object.
 * @param String content           The HTML string to write.
 */
Manager.prototype.writeHTML = function(resp, content) {
    FW.ValueChecker.instance_of(
        resp, 'resp', http.ServerResponse
    );
    FW.ValueChecker.string(content, 'content', true);
    try {
        resp.writeHead(
            HTTPStatusCodes.OK,
            {'Content-Type': 'text/html'}
        );
        resp.end(content);
    } catch (e) {
        this.writeInternalServerError(resp, e);
    }
};

/**
 * Writes an internal server error to the response object.
 *
 * @param http.ServerResponse resp Reponse Object.
 * @param Array err                Error array. Will be logged.
 */
Manager.prototype.writeInternalServerError = function(resp, err) {
    FW.ValueChecker.instance_of(
        resp, 'resp', http.ServerResponse
    );
    resp.writeHead(
        HTTPStatusCodes.INTERNAL_SERVER_ERROR,
        {'Content-Type': 'text/plain'}
    );
    resp.end('Internal Server Error');
    this.log(JSON.stringify(err));
};

/**
 * Writes an object as JSON string to the response object.
 *
 * @param http.ServerResponse resp Reponse Object.
 * @param Object res               Object to write.
 */
Manager.prototype.writeJson = function(resp, res) {
    FW.ValueChecker.instance_of(
        resp, 'resp', http.ServerResponse
    );
    try {
        resp.writeHead(
            HTTPStatusCodes.OK,
            {'Content-Type': 'application/json;charset=utf-8'}
        );
        resp.end(JSON.stringify(res));
    } catch (e) {
        this.writeInternalServerError(resp, e);
    }
};

/**
 * Writes forbidden to the response object.
 *
 * @param http.ServerResponse resp Reponse Object.
 */
Manager.prototype.writeForbidden = function(resp) {
    FW.ValueChecker.instance_of(
        resp, 'resp', http.ServerResponse
    );
    resp.writeHead(
        HTTPStatusCodes.FORBIDDEN,
        {'Content-Type': 'text/plain'}
    );
    resp.end('Forbidden');
};

/**
 * Write not found to the reponse object.
 *
 * @param http.ServerResponse resp Reponse Object.
 */
Manager.prototype.writeNotFound = function(resp) {
    FW.ValueChecker.instance_of(
        resp, 'resp', http.ServerResponse
    );
    resp.writeHead(
        HTTPStatusCodes.NOT_FOUND,
        {'Content-Type': 'text/plain'}
    );
    resp.end('File not found');
};

/**
 * Writes unauthorized to the response object.
 *
 * @param http.ServerResponse resp Reponse Object.
 */
Manager.prototype.writeUnauthorized = function(resp) {
    FW.ValueChecker.instance_of(
        resp, 'resp', http.ServerResponse
    );
    resp.writeHead(
        HTTPStatusCodes.UNAUTHORIZED,
        {'content-type': 'text/plain'}
    );
    resp.end('Authorization Required');
};

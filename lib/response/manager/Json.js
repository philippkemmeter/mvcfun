/**
 * Handler for Plain text responses.
 *
 * @module mvc.response.manager.Plain
 * @author Philipp Kemmeter
 */
var http            = require('http'),
    responseManager = require('../Manager'),
    HTTPStatusCodes = require('../../http/StatusCodes.js'),
    util            = require('util'),
    VC              = require('valuechecker');

/**
 * Creates a new response manager.
 *
 * @param {String} options      Options:
 *        - charset:     The charset to set in header for all responses. May be
 *                       changed later.
 * @constructor
 */
module.exports = function(options) {
    if (!options) options = {};
    options.contentType = 'application/json';
    responseManager.call(this, options);
};
util.inherits(module.exports, responseManager);

/**
 * Writes an object as JSON string to the response object.
 *
 * @param {http.ServerResponse} resp Reponse Object.
 * @param {Object} content           Object to write.
 * @param {String} language          The language of the content.
 */
module.exports.prototype.write = function(resp, content, language) {
    VC.instance_of(resp, 'resp', http.ServerResponse);
    try {
        VC.instance_of(content, 'content', Object);
        resp.writeHead(
            HTTPStatusCodes.OK,
            this._createHeader(language)
        );
        resp.end(JSON.stringify(content));
    } catch (e) {
        this.writeInternalServerError(resp, e, language);
    }
};

/**
 * Prepares the error message before it's being sent to the client.
 *
 * @param {String} message Message to be prepared.
 * @return {String}
 */
module.exports.prototype._prepareErrorMessage = function(message) {
    var err = {}; err.error = message;
    return JSON.stringify(err);
};

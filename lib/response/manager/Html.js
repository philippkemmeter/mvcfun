/**
 * Handler for HTML responses.
 *
 * @module mvc.response.manager.Html
 * @author Philipp Kemmeter
 */
var responseManager = require('../Manager'),
    util            = require('util');

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
    options.contentType = 'text/html';
    responseManager.call(this, options);
};
util.inherits(module.exports, responseManager);

/**
 * Prepares the error message before it's being sent to the client.
 *
 * @param {String} message Message to be prepared.
 * @return {String}
 */
module.exports.prototype._prepareErrorMessage = function(message) {
    return '<html><head><title>'
        + message + '</title></head><body><h1>'
        + message + '</h1></body></html>';
};

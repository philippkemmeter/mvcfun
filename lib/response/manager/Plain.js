/**
 * Handler for Plain text responses.
 *
 * @module mvc.response.manager.Plain
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
    options.contentType = 'text/plain';
    responseManager.call(this, options);
};
util.inherits(module.exports, responseManager);

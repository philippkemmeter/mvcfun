/**
 * This is an abstract super class of the manager's helpers.
 *
 * Those helpers are request.Controller and request.File.
 *
 * No helper works on it's own, it has to be added to a manager.
 *
 * @module mvcfun.request.Helper
 * @author Philipp Kemmeter
 */
var VC              = require('valuechecker'),
    EventEmitter    = require('events').EventEmitter,
    util            = require('util'),
    nepp            = require('nepp');

/**
 * Creates a new general helper object.
 *
 * Events:
 *
 * 'error'
 * This will be emitted on all runtime errors.
 *
 * @constructor
 */
module.exports = function() {
    /**
     * The request manager this helper belongs to.
     * Will be set on registering the helper to a manager by the manager.
     * See also request.Manager.constructor.
     *
     * @protected
     * @var request.Manager
     */
    this._requestManager = null;
    nepp(this);
};

util.inherits(module.exports, EventEmitter);

/**
 * The request manager.
 *
 * @member {request.Manager} requestManager
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'requestManager',
    function getRequestManager() {
        return this._requestManager;
    }
);

/**
 * The session object.
 *
 * @member {Object} session
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'session',
    function getSession() {
        if (!this.requestManager)
            throw new Error('Helper does not belong to any request manager!');
        return this.requestManager.session;
    }
);

/**
 * The response manager.
 *
 * @member {response.Manager} responseManager
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'responseManager',
    function getResponseManager() {
        if (!this.requestManager)
            throw new Error('Helper does not belong to any request manager!');
        return this.requestManager.responseManager;
    }
);

/**
 * Logs the message via the request manager's log method.
 *
 * @param {String} message Message to log.
 */
module.exports.prototype.log = function(message) {
    if (!this.requestManager)
        throw new Error('Helper does not belong to any request manager!');
    this.requestManager.log(message);
};

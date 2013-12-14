/**
 * This object manages the request.
 *
 * It's the first address and  decides, what kind of response  we have and which
 * handler is to be called.
 *
 * @module mvcfun.request.Manager
 * @author Philipp Kemmeter
 */
var http         = require('http'),
    VC           = require('valuechecker'),
    EventEmitter = require('events').EventEmitter,
    util         = require('util'),
    url          = require('url'),
    nepp         = require('nepp');

/**
 * Creates a new Manager instance.
 *
 * Events:
 *
 * 'log' Event:
 * In controllers, use the log methods to emit this event.
 *
 * @param {response.Manager} respManager    Response mananger.
 * @param {request.Controller} requestController  Controller manager.
 * @constructor
 */
module.exports = function(respManager, requestController) {
    /**
     * Session object.
     *
     * @var {Object}
     * @protected
     */
    this._session = null;

    /**
     * Response manager.
     *
     * @var {response.Manager}
     * @protected
     */
    this._responseManager = null;

    /**
     * Helper to manage controllers.
     *
     * @var {request.Controller}
     * @protected
     */
    this._requestController = null;

    /**
     * Contains the request data. Will be set on every request by the
     * http.Server instance.
     *
     * @var {request.Data}
     * @protected
     */
    this._requestData = null;

    nepp(this);

    this.responseManager = respManager;

    this.requestController = requestController;
    this.requestController._requestManager = this;

    var _this = this;
    this.requestController.on('error', function(err) { _this._error(err); });
};

util.inherits(module.exports, EventEmitter);

/**
 * Caught errors are emitted via this method.
 *
 * @param {Object} err Error occured.
 * @protected
 */
module.exports.prototype._error = function(err) {
    this.emit('error', err);
};

/**
 * Handles request to files to be delivered.
 *
 * @param {String} filename          Request path and filename.
 * @param {String} method            The method (POST or GET etc).
 * @param {http.ServerResponse resp} Server response Object. Write your data
 *                                   into this object directly.
 */
module.exports.prototype.run = function(filename, method, resp) {
    VC.string(filename, 'filename', true);
    VC.instance_of(resp, 'resp', http.ServerResponse);

    if (this.requestController.getController(filename))
        this.requestController.run(filename, method, resp);
    else
        this.responseManager.writeNotFound(resp);

};

/**
 * Logs the message via the log client.
 *
 * @param {String} message Message to log.
 */
module.exports.prototype.log = function(message) {
    this.emit('log', message);
};

// {{{ Getter / Setter

/**
 * The controller manager helper object.
 *
 * @member {request.Controller} requestController
 */
nepp.createGS(module.exports.prototype, 'requestController',
    function getRequestController() {
        return this._requestController;
    },
    function setRequestController(requestController) {
        this._requestController = VC.instance_of(
            requestController, 'requestController', require('./Controller')
        );
    }
);

/**
 * The session object. Changable on the fly.
 *
 * @member {Object} session
 */
nepp.createGS(module.exports.prototype, 'session',
    function getSession() {
        return this._session;
    },
    function setSession(session) {
        this._session = VC.instance_of(session, 'session', Object);
    }
);

/**
 * Contains the data of the current request like headers etc.
 *
 * @member {request.Data}
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'requestData',
    function getSession() {
        return this._requestData;
    }
);

/**
 * The response manager.
 *
 * @member {response.Manager} responseManager
 */
nepp.createGS(module.exports.prototype, 'responseManager',
    function getResponseManager() {
        return this._responseManager;
    },
    function setResponseManager(respManager) {
        this._responseManager = VC.instance_of(
            respManager, 'respManager', require('../response/Manager')
        );
    }
);

// }}}

nepp(module.exports.prototype);

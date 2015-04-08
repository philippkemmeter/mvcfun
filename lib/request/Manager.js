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
 * @param {Object} respManagers                   Response manangers.
 * @param {request.Manager} getDefaultRespManC    Function returning the default
 *                                                request manager.
 * @param {request.Controller} requestController  Controller manager.
 * @constructor
 */
module.exports = function(respManagers, getDefaultRespManCb, requestController) {
    /**
     * Session object.
     *
     * @var {Object}
     * @protected
     */
    this._session = null;

    /**
     * Response managers.
     *
     * @var {Object}
     * @protected
     */
    this._responseManagers = {
        'text/html':        null,
        'text/plain':       null,
        'application/json': null
    };

    /**
     * Returning the default response manager.
     *
     * @var {response.Manager}
     * @proteceted
     */
    this._getDefaultRespManCb = null;

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

    this._responseManagers = respManagers;
    this._getDefaultRespManCb = getDefaultRespManCb;

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
 * @param {http.ServerResponse resp} Server response Object. Write your data
 *                                   into this object directly.
 * @param {String} filename          Request path and filename.
 */
module.exports.prototype.run = function(resp, filename) {
    VC.string(filename, 'filename', true);
    VC.instance_of(resp, 'resp', http.ServerResponse);

    var ctrl = this.requestController.getController(
        this.requestData.host,
        this.requestData.port,
        filename
    );

    if (ctrl)
        this.requestController.run(resp, ctrl);
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
 * The response managers.
 *
 * @member {Object} responseManagers
 */
nepp.createGS(module.exports.prototype, 'responseManagers',
    function getResponseManagers() {
        return this._responseManagers;
    }
);

/**
 * The default response manager.
 *
 * @member {response.Manager} responseManager
 */
nepp.createGS(module.exports.prototype, 'responseManager',
    function getResponseManager() {
        return this._getDefaultRespManCb();
    }
);

// }}}

nepp(module.exports.prototype);

/**
 * This object manages the request.
 *
 * It's the first address and  decides, what kind of response  we have and which
 * handler is to be called.
 *
 * @module mvcfun.request.manager
 * @author Philipp Kemmeter
 */
var http         = require('http'),
    VC           = require('valuechecker'),
    EventEmitter = require('events').EventEmitter,
    util         = require('util'),
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
     * Contains the parsed body of the current request.
     *
     * @protected
     */
    this._body = null;

    /**
     * Contains the raw body of the current request.
     *
     * @protected
     */
    this._rawBody = '';

    /**
     * Contains the query as object of the current request; i.e. the parsed
     * query string.
     *
     * @protected
     */
    this._query = null

    nepp(this);

    this.responseManager = respManager;

    this.requestController = requestController;
    this.requestController._requestManager = this;

    var _this = this;
    this.requestController.on('error', function(err) { _this._error(err); });
};

util.inherits(module.exports, EventEmitter);

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

/**
 * The controller manager helper object.
 *
 * @member {request.Controller} requestController
 */
Object.defineProperty(module.exports.prototype, 'requestController', {
    get: function getRequestController() {
        return this._requestController;
    },
    set: function setRequestController(requestController) {
        this._requestController = VC.instance_of(
            requestController, 'requestController', require('./Controller')
        );
    },
    enumerable: true
});

/**
 * The query as object of the current request, i.e. the parsed query string.
 *
 * @member {Object} query
 * @readonly
 */
Object.defineProperty(module.exports.prototype, 'query', {
    get: function getQuery() {
        return this._query;
    },
    enumerable: true
});

/**
 * The parsed body object.
 *
 * If this returns null, the body could not be parsed. Check the raw body in
 * this case.
 *
 * @member {Object|null} body
 * @readonly
 */
Object.defineProperty(module.exports.prototype, 'body', {
    get: function getBody() {
        return this._body;
    },
    enumerable: true
});

/**
 * The raw body. I.e. this is an unparsed plain raw string.
 *
 * @member {String} rawBody
 * @readonly
 */
Object.defineProperty(module.exports.prototype, 'rawBody', {
    get: function getRawBody() {
        return this._rawBody;
    },
    enumerable: true
});

/**
 * The session object. Changable on the fly.
 *
 * @member {Object} session
 */
Object.defineProperty(module.exports.prototype, 'session', {
    get: function getSession() {
        return this._session;
    },
    set: function setSession(session) {
        this._session = VC.instance_of(session, 'session', Object);
    },
    enumerable: true
});

/**
 * The response manager.
 *
 * @member {response.Manager} responseManager
 */
Object.defineProperty(module.exports.prototype, 'responseManager', {
    get: function getResponseManager() {
        return this._responseManager;
    },
    set: function setResponseManager(respManager) {
        this._responseManager = VC.instance_of(
            respManager, 'respManager', require('../response/Manager')
        );
    },
    enumerable: true
});

/**
 * Sets the query object, the body object and the raw body string.
 *
 * This is a combi setter, because those values must not be changed but by the
 * Server object owning this manager.
 *
 * @param {Object} query     Query object.
 * @param {Object|null} body Body object.
 * @param {String} rawBody  Raw body.
 */
module.exports.prototype.setQueryAndBody = function(query, body, rawBody) {
    this._query = VC.instance_of(query, 'query', Object);
    this._body = (body === null) ? null : VC.instance_of(body, 'body', Object);
    this._rawBody = VC.string(rawBody, 'rawBody', true);
};

/**
 * Caught errors are emitted via this method.
 *
 * @param {Object} err Error occured.
 * @protected
 */
module.exports.prototype._error = function(err) {
    this.emit('error', err);
};

nepp(module.exports.prototype);

/**
 * This is the main object: the HTTP server.
 *
 * @author Philipp Kemmeter
 */
var http            = require('http'),
    HTTPStatusCodes = require('./StatusCodes'),
    util            = require('util'),
    url             = require('url'),
    fs              = require('fs'),
    path            = require('path'),
    VC              = require('valuechecker'),
    nepp            = require('nepp'),
    Mime            = require('../Mime'),
    response        = require('../response'),
    request         = require('../request'),
    sesh            = require('sesh'),
    EventEmitter    = require('events').EventEmitter;

/**
 * Creates a new Server object.
 *
 * Events:
 *
 * Emits the all events http.Server do emit (actually, on-method is wrapped).
 *
 * 'log' Event:
 * In addition, the 'log' event is emitted, if there's something worth logging.
 * The listener will be called with the message to be logged as first argument.
 * How much is logged of the classes of this package is defined by the logLevel
 * (see options below).
 *
 * You can use the log method of controllers to emit this event manually.
 *
 * @param {Object} options Options:
 *                         - allowedMethods:   Array of http methods allowed.
 *                                             All methods are allowed by
 *                                             default. Controllers may disable
 *                                             methods on ressource base.
 *                         - reqBodyMaxLength: The max length of the request
 *                                             body. You may disable this
 *                                             security feature by setting this
 *                                             to a negative value. Defaults to
 *                                             1000.
 *                         - logLevel:         The higher the level, the more is
 *                                             logged by emitting the log event.
 *                                             Has to be an int value between -1
 *                                             and 5. Defaults to 0, i.e. that
 *                                             the log event is emitted manually
 *                                             in controllers, only.
 *                         - requestManager    The request manager to use.
 *                                             If omitted, the default manager
 *                                             will be created.
 *                         - responseManager   The response manager to use.
 *                                             If omitted, the default manager
 *                                             will be created.
 * @constructor
 */
module.exports = function(options) {
    /**
     * The response manager to use.
     *
     * @var {response.Manager}
     * @protected
     */
    this._responseManager = null;

    /**
     * The request manager to use.
     *
     * @var {request.Manager}
     * @protected
     */
    this._requestManager = null;

    /**
     * The methods general allowed by the server.
     *
     * @var {Array}
     * @protected
     */
    this._allowedMethods = module.exports.METHODS;

    /**
     * The max length of the request body. This is a security feature.
     *
     * @var {Integer}
     * @protected
     */
    this._reqBodyMaxLength = 1000;

    /**
     * Instance of the http.Server (of node's http package) class.
     *
     * @var {http.Server}
     * @protected
     */
    this._httpServer = null;

    /**
     * The higher the log level, the more information will be emitted in the log
     * channel.
     *
     * Between 0 (no logging) and 5 (insane logging).
     *
     * @var {Integer}
     * @protected
     */
    this._logLevel = 1;

    nepp(this);

    var _this = this;

    if (options && options.responseManager) {
        this.responseManager = options.responseManager;
    } else {
        this.responseManager = new response.Manager();
    }

    this.responseManager.on('log', function(msg) { _this._log(msg); })
        .on('error', function(err) { _this._error(err); });

    if (options && options.requestManager) {
        this.requestManager = options.requestManager;
        if (options.responseManager)
            this.requestManager.responseManager = options.responseManager;
    } else {
        this.requestManager = new request.Manager(
            this.responseManager,
            new request.Controller()
        );
    }

    this.requestManager.on('log', function(msg) { _this._log(msg); })
        .on('error', function(err) { _this._error(err); });

    if (options) {
        if (options.allowedMethods)
            this.allowedMethods = options.allowedMethods;
        if (options.reqBodyMaxLength)
            this.reqBodyMaxLength = options.reqBodyMaxLength;
        if (options.logLevel)
            this.logLevel = options.logLevel;
    }

    this._httpServer = http.createServer(function(req, resp) {
        _this.main(req, resp);
    });
    this.httpServer.on('error', function(err) { _this._error(err); });
};

util.inherits(module.exports, EventEmitter);

/**
 * Static list of all http methods, that exist.
 *
 * @constant
 */
Object.defineProperty(module.exports, 'METHODS', {
    value:        [
                    'OPTIONS',
                    'GET',
                    'HEAD',
                    'POST',
                    'PUT',
                    'DELETE',
                    'TRACE',
                    'CONNECT'
                  ],
    enumerable:   true,
    configurable: true,
    writable:     false
});

/**
 * Wrapper for http.Server.listen (the node's one).
 *
 * See node's manual for parameters.
 *
 * @returns {Server} Returns this for chaining.
 */
module.exports.prototype.listen = function() {
    this.httpServer.listen.apply(this.httpServer, arguments);
    return this;
};

/**
 * Wrapper for http.Server.close (the node's one).
 *
 * See node's manual for parameters.
 */
module.exports.prototype.close = function() {
    this.httpServer.close.apply(this.httpServer, arguments);
};

/**
 * Register to an event.
 *
 * Wraps http.Server.on for events, that this class do not emit itself.
 *
 * @param {String} ev         The event to register to.
 * @param {Function} listener Listener that will be called.
 * @returns {Server} Returns this for chaining.
 */
module.exports.prototype.on = function(ev, listener) {
    if (ev == 'log' || ev == 'error') // @error: See constructor.
        return EventEmitter.prototype.on.call(this, ev, listener);

    this.httpServer.on(ev, listener);
    return this;
};

/**
 * This method is the callback for http.createServer.
 *
 * @param {http.ClientRequest} req   Request object.
 * @param {http.ServerResponse} resp Response object.
 */
module.exports.prototype.main = function(req, resp) {
    try {
        if (this._allowedMethods.indexOf(req.method) == -1) {
            this.responseManager.writeMethodNotAllowed(resp, req.method);
            return;
        }

        var _this = this;

        sesh.session(req, resp, function(req, resp) {
            try {
                var filename = req.url.split('?')[0];

                // req.session was created by sesh
                _this.requestManager.session = req.session;

                // fetch the body
                var body = null;
                var rawBody = '';

                // TODO: upgrade to streams2

                req.on('data', function(data) {
                    if (rawBody.length > _this.reqBodyMaxLength) {
                        req.connection.destroy();
                    }

                    rawBody += data;
                });

                req.on('end', function() {
                    try {
                        var body = _this._parse_body(rawBody);
                    } catch (e) {
                        var body = null;
                    }
                    var query = url.parse(req.url, true).query || {};

                    _this.requestManager.setQueryAndBody(query, body, rawBody);
                    _this.requestManager.run(filename, req.method, resp);
                });

            } catch (e) {
                _this.responseManager.writeInternalServerError(resp, e);
                _this.emit('error', e);
            }
        });
    } catch(e) {
        this.responseManager.writeInternalServerError(resp, e);
        this.emit('error', e);
    }
};

/**
 * Adds a controller on runtime.
 *
 * Registers it to the filename the controller has been bound to.
 *
 * @param {controller.Base} controller The controller to add.
 */
module.exports.prototype.addController = function(controller) {
    this.requestManager.requestController.addController(controller);
};

/**
 * Removes a controller on runtime.
 *
 * The controller may be identified by either the instance, that had been
 * added before, or the filename the controller is bound to.
 *
 * @param {controller.Base|String|RegExp} id Either controller instance or
 *                                           filename.
 * @returns {Boolean} If the controller was found.
 */
module.exports.prototype.removeController = function(id) {
    return this.requestManager.requestController.removeController(id);
};

/**
 * Parses the body.
 *
 * @param {String} rawBody The raw body to parse.
 * @returns {Object}
 * @throws {Error} if it could not be parsed at all.
 * @protected
 */
module.exports.prototype._parse_body = function(rawBody) {
    return JSON.parse(VC.string(rawBody, 'rawBody'));
};

/**
 * This method logs a message as specified.
 *
 * @param {String} msg Message to log.
 * @protected
 */
module.exports.prototype._log = function(msg) {
    try {
        msg = VC.string(msg, 'msg');
    } catch (e) {
        this.emit('error', e);
    }
    this.emit('log', msg);
};

/**
 * Caught errors are emitted via this method.
 *
 * @param {Object} err Error occured.
 * @protected
 */
module.exports.prototype._error = function(err) {
    this.emit('error', err);
    if (this.logLevel > 0)
        this._log(String(err));
};

/**
 * The request manager.
 *
 * @member {request.Manager} requestManager
 */
nepp.createGS(module.exports.prototype, 'requestManager',
    function getRequestManager() {
        return this._requestManager;
    },
    function setRequestManager(requestManager) {
        this._requestManager = VC.instance_of(
            requestManager, 'requestManager', request.Manager
        );
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
    function setResponseManager(responseManager) {
        this._responseManager = VC.instance_of(
            responseManager, 'responseManager', response.Manager
        );
    }
);

/**
 * The max length of the request body. You may disable this security feature by
 * setting this to a negative value.
 *
 * @member {Integer} reqBodyMaxLength
 */
nepp.createGS(module.exports.prototype, 'reqBodyMaxLength',
    function getReqBodyMaxLength() {
        return this._reqBodyMaxLength;
    },
    function setReqBodyMaxLength(bodylength) {
        this._reqBodyMaxLength = VC.int(bodylength, 'bodylength');
    }
);

/**
 * Array of http methods allowed. All methods are allowed by default.
 * Controllers may disable methods on ressource base.
 *
 * @member {Array} allowedMethods
 */
nepp.createGS(module.exports.prototype, 'allowedMethods',
    function getAllowedMethods() {
        return this._allowedMethods;
    },
    function setAllowdMethods(methods) {
        methods.forEach(function(elem, i, arr) {
            arr[i] = arr[i].toUpperCase();
            VC.values(arr[i], 'methods['+i+']', module.exports.METHODS);
        });
        this._allowedMethods = methods;
    }
);

/**
 * The instance of http.Server that has been created using http.createServer in
 * constructor.
 *
 * This access can be used to register to events this server etc.
 *
 * @member {http.Server} httpServer
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'httpServer',
    function getHttpServer() {
        return this._httpServer;
    }
);

/**
 * The log level. The higher the more log events will be emitted.
 *
 * Valid values are:
 * -1: Absolutely no logging. Even manual log calls in controllers are ignored.
 *  0: Manual log calls in controllers are emitted, only.
 *  1: All before plus runtime errors.
 *     Note, that errors will be re-emitted as error event as well. Since error
 *     events emit objects and log events emit strings, the log event emit the
 *     error message, not the error object.
 *  2: All before plus runtime warnings about malformed configuration etc.
 *  3: All before plus setup information on first connect.
 *  4: All before plus debug information on each connect.
 *  5: All before plus insane amount of debug information.
 *
 * @member {Integer} logLevel
 */
nepp.createGS(module.exports.prototype, 'logLevel',
    function getLogLevel() {
        return this._logLevel;
    },
    function setLogLevel(logLevel) {
        this._logLevel = VC.int(logLevel, 'logLevel', -1, 5);
    }
);

nepp(module.exports.prototype);

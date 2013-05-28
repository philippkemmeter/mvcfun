/**
 * Controller base.
 *
 * @module mvcfun.controller.Base
 * @author Philipp Kemmeter
 */
var VC              = require('valuechecker'),
    http            = require('http'),
    nepp            = require('nepp'),
    ReqCtrl         = require('../request/Controller.js'),
    HTTPStatusCodes = require('../http/StatusCodes');

/**
 * Creates a new Base object.
 *
 * The filename to register to may either be a string or a RegExp object.
 *
 * Please note, that a pattern as a string will NOT work for pattern matching,
 * you have to pass a valid RegExp object to make this feature work.
 *
 * @param {String|RegExp} filename Filename to register to.
 * @param {Object}        options  The base controller do not accept any
 *                                 options, but inherited objects may do.
 * @constructor
 */
module.exports = function(filename, options) {
    /**
     * The filename this controller is registered to.
     *
     * @protected
     * @var {String}
     */
    this._filename = '';

    /**
     * The controller manager will be set on registering the controller.
     * See request.Controller.prototype.addController for details.
     *
     * @protected
     * @var {request.Controller}
     */
    this._requestController = null;

    nepp(this);

    try {
        this._filename = VC.instance_of(filename, 'filename', RegExp);
    } catch (e) {
        filename = VC.string(filename, 'filename');

        if (filename.charAt(0) != '/') {
            throw new Error(
                'The static ressource path has to start with a slash. '+
                'Try /' + filename + ' instead'
            );
        }

        this._filename = filename;
    }
};

/**
 * The filename the controller is registered to.
 *
 * @member {String|RegExp} filename
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'filename',
    function getFilename() {
        return this._filename;
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
        if (!this.requestController) {
            throw new Error(
                'Controller does not belong to a controller manger!'
            );
        }
        return this.requestController.responseManager;
    }
);

/**
 * The request manager.
 *
 * @member {request.Manager} requestManager
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'requestManager',
    function getRequestManager() {
        if (!this.requestController) {
            throw new Error(
                'Controller does not belong to a controller manger!'
            );
        }
        return this.requestController.requestManager;
    }
);

/**
 * The request controller.
 *
 * @member {request.Controller} requestController
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'requestController',
    function getRequestController() {
        return this._requestController;
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
        if (!this.requestController) {
            throw new Error(
                'Controller does not belong to a controller manger!'
            );
        }
        return this.requestController.session;
    }
);

/**
 * The parsed request body aka post data.
 *
 * If this is null, the body could not be parsed. You may want to check then the
 * raw body instead.
 *
 * @member {Object|null} body
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'body',
    function getBody() {
        return this.requestManager.body;
    }
);

/**
 * The raw request body aka raw post data.
 *
 * @member {String} rawBody
 */
nepp.createGS(module.exports.prototype, 'rawBody',
    function getRawBody() {
        return this.requestManager.rawBody;
    }
);

/**
 * The parsed query string aka get data.
 *
 * @member {Object} query
 */
nepp.createGS(module.exports.prototype, 'query',
    function getQuery() {
        return this.requestManager.query;
    }
);

/**
 * Call this, if you want to log something in your controller.
 *
 * @param {String} mesasge The mesage to log.
 */
module.exports.prototype.log = function(message) {
    this.requestController.log(message);
};

/**
 * Runs the controller.
 *
 * Writes directly to the given response object.
 *
 * @param {String} method            HTTP method (POST or GET etc).
 * @param {http.ServerResponse} resp Server  response  object.  Write your  data
 *                                   into this object directly.
 * @param {String} path              Fully qualified path to requested object...
 */
module.exports.prototype.run = function(method, resp, path) {
    VC.instance_of(resp, 'resp', http.ServerResponse);
    resp.writeHead(HTTPStatusCodes.OK,
        {'Content-Type': 'text/plain'}
    );
    resp.end(
        method + "\n" +
        'request body:' + JSON.stringify(this.body) + "\n" +
        'query:' + JSON.stringify(this.query)
    );
};

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

    /**
     * The current language of the controller. Has to be one of the iso strings
     * 'en', 'de', ... This will be added to any response header at run:
     *
     * For instance: 'Content-language: en'.
     *
     * If not set, the header line will not be added.
     *
     * @protected
     * @var {String}
     */
    this._language = '';

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
 * The language of the content to be delivered by this controller.
 *
 * May be changed any time before calling run.
 *
 * @member {String} language
 */
nepp.createGS(module.exports.prototype, 'language',
    function getLanguage() {
        return this._language;
    },
    function setLanguage(l) {
        this._language = (l !== '')
            ? VC.string(l, 'l', false, 2, 2)
            : '';
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
 * The data of the current request.
 *
 * @member {request.Data}
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'request',
    function getRequest() {
        return this.requestManager.requestData;
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
 * It send's some header. This method is meant to be overridden and called by
 * their children.
 *
 * @param {http.ServerResponse} resp Server  response  object.  Write your  data
 *                                   into this object directly.
 * @param {String} path              Fully qualified path to requested object...
 */
module.exports.prototype.run = function(resp, path) {
    VC.instance_of(resp, 'resp', http.ServerResponse);
    VC.string(path, 'path', true);
    this.responseManager.writeText(
        resp,
        this.request.method + "\n" +
        'headers:' + JSON.stringify(this.request.headers) + "\n" +
        'host:' + this.request.host + "\n" +
        'port:' + this.request.port + "\n" +
        'request body:' + JSON.stringify(this.request.body) + "\n" +
        'query:' + JSON.stringify(this.request.query),
        this.language
    );
};

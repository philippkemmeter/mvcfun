/**
 * Controller base.
 *
 * @module mvcfun.controller.Base
 * @author Philipp Kemmeter
 */
var VC              = require('valuechecker'),
    http            = require('http'),
    nepp            = require('nepp');

/**
 * Creates a new Base object.
 *
 * The path to register to may either be a string or a RegExp object.
 *
 * Please note, that a pattern as a string will NOT work for pattern matching,
 * you have to pass a valid RegExp object to make this feature work.
 *
 * @param {String|RegExp} path     Path to register to.
 * @param {Object}        options  Optional options:
 *                                 - {String|RegExp} host:  Bind this controller
 *                                          to a specific host. E.g. "localhost"
 *                                          or "www.example.org". May be a
 *                                          regular expression object, so
 *                                          /.*\.example\.org$/i is also valid.
 *                                          Defaults to any host.
 *                                 - {Integer|RegExp} port: Bind this controller
 *                                          to a specific port. May be a regular
 *                                          expression object, so /8.*$/ is
 *                                          also valid. Defaults to any port.
 * @constructor
 */
module.exports = function(path, options) {

    if (!options) options = {};
    else VC.instance_of(options, 'options', Object);

    /**
     * The path this controller is registered to.
     *
     * @protected
     * @var {String|RegExp}
     */
    this._path = '';

    /**
     * The host this controller is registered to.
     *
     * @protected
     * @var {String|RegExp}
     */
    this._host = null;

    /**
     * The port this controller is registered to.
     *
     * @protected
     * @var {Integer|RegExp}
     */
    this._port = null;

    /**
     * The controller manager will be set on registering the controller.
     * See request.Controller.prototype.addController for details.
     *
     * @protected
     * @var {request.Controller}
     */
    this._requestController = null;

    /**
     * The instance of the server which is running this controller. This will
     * be injected by the server itself on registering a controller.
     * See http.Server.prototype.addController for details.
     *
     * @protected
     * @var {http.Server}
     */
    this._server = null;

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
        this._path = VC.instance_of(path, 'path', RegExp);
    } catch (e) {
        path = VC.string(path, 'path', false);

        if (path.charAt(0) != '/') {
            throw new Error(
                'The static ressource path has to start with a slash. '+
                'Try /' + path + ' instead'
            );
        }

        this._path = path;
    }

    if (options.host) {
        try {
            this._host = VC.instance_of(options.host, 'options.host', RegExp);
        } catch (e) {
            this._host = VC.string(options.host, 'options.host', false);
        }
    }

    if (options.port) {
        try {
            this._port = VC.instance_of(options.port, 'options.port', RegExp);
        } catch (e) {
            this._port = VC.string(options.port, 'options.port', false);
        }
    }
};

/**
 * The path the controller is registered to.
 *
 * @member {String|RegExp} path
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'path',
    function getPath() {
        return this._path;
    }
);

/**
 * The host the controller is registered to.
 *
 * @member {String|RegExp} host
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'host',
    function getHost() {
        return this._host;
    }
);

/**
 * The port the controller is registered to.
 *
 * @member {Integer|RegExp} port
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'port',
    function getPort() {
        return this._port;
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
        return this.requestController.requestManager.responseManager;
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
 * The server.
 *
 * @member {http.Server} server
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'server',
    function getServer() {
        return this._server
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
 */
module.exports.prototype.run = function(resp) {
    VC.instance_of(resp, 'resp', http.ServerResponse);

    var o = {
        method: this.request.method,
        headers: JSON.stringify(this.request.headers),
        host: this.request.host,
        port: this.request.port,
        'request body': JSON.stringify(this.request.body),
        path: this.request.path,
        query: JSON.stringify(this.request.query)
    };

    var content = '';

    switch (this.responseManager.contentType) {
        case 'text/html':
            content = '<html><head></head><body><table>';
            for (var i in o) {
                content += '<tr><td>'
                    + i + '</td><td>' + o[i] + '</td></tr>';
            }
            content += '</table>';
            break;
        case 'application/json':
            content = o;
            break;
        default:
            for (var i in o) {
                content += i + ': ' + o[i] + "\n";
            }
    }

    this.responseManager.write(
        resp,
        content,
        this.language
    );
};

/**
 * This controller respondes with 403 (forbidden) always.
 *
 * @module mvcfun.controller.Forbidden
 * @author Philipp Kemmeter
 */
var VC   = require('valuechecker'),
    http = require('http'),
    url  = require('url'),
    fs   = require('fs'),
    util = require('util'),
    nepp = require('nepp'),
    Base = require('./Base');

/**
 * Creates a new 403 controller..
 *
 * The path to register to may either be a string or a RegExp object.
 * Please note, that a pattern as a string will NOT work for pattern matching,
 * you have to pass a valid RegExp object to make this feature work.
 *
 * @param {String|RegExp} path     Path to register to.
 * @param {Object}        options  Options are:
 *                                 - {Boolean} alwaysForbidden: If this is true,
 *                                          forbidden will be echoed always. If
 *                                          false and the requested ressource
 *                                          doesn't exist, 404 will be returned
 *                                          instead.  Defaults to false.
 *                                 - {String} htdocsDir: If alwaysForbidden is
 *                                          false, the file test will be done
 *                                          relatively to this directory.
 *                                          Defaults to './htdocs'.
 *                                 - {String|RegExp} host: Bind this controller
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
    Base.call(this, path, options);

    if (!options) options = {};

    /**
     * If forbidden should be returned always.
     *
     * @protected
     * @var {Boolean}
     */
    this._alwaysForbidden = (options && options.alwaysForbidden);

    /**
     * Directory where the htdocs are located.
     *
     * @var {String}
     * @protected
     */
    this._htdocsDir = '';

    nepp(this);

    this.htdocsDir = options.htdocsDir || './htdocs';
};
util.inherits(module.exports, Base);

/**
 * Runs the controller.
 *
 * Writes directly to the given response object.
 *
 * @param {http.ServerResponse} resp Server response Object. Write your data
 *                                   into this object directly.
 */
module.exports.prototype.run = function(resp) {
    VC.instance_of(resp, 'resp', http.ServerResponse);

    if (!this.alwaysForbidden) {
        var path = this.htdocsDir + this.request.path;
        var _this = this;
        fs.exists(path, function(exists) {
            if (exists)
                _this.responseManager.writeForbidden(resp, _this.language);
            else {
                _this.responseManager.writeNotFound(resp, path, _this.language);
            }
        });
    } else
        this.responseManager.writeForbidden(resp, this.language);
};

// {{{ Getter/Setter

/**
 * If this is true, forbidden will be echoed always. If false and the requested
 * ressource doesn't exist, 404 will be returned instead. Defaults to false.
 *
 * @member {Boolean} alwaysForbidden
 */
nepp.createGS(module.exports.prototype, 'alwaysForbidden',
    function getAlwaysForbidden() {
        return this._alwaysForbidden;
    }
);

/**
 * The htdocs dir.
 *
 * @member {String} htdocsDir
 */
nepp.createGS(module.exports.prototype, 'htdocsDir',
    function getHtdocsDir() {
        return this._htdocsDir;
    },
    function setHtdocsDir(dir) {
        this._htdocsDir = VC.string(dir, 'dir');
    }
);

// }}}

/**
 * Redirects every request to a specified uri.
 *
 * @module mvcfun.controller.Redirect
 * @author Philipp Kemmeter
 */
var VC          = require('valuechecker'),
    http        = require('http'),
    nepp        = require('nepp'),
    Base        = require('./Base'),
    util        = require('util'),
    StatusCodes = require('../http/StatusCodes');

/**
 * Creates a new Redirect object.
 *
 * The path to register to may either be a string or a RegExp object.
 *
 * Please note, that a pattern as a string will NOT work for pattern matching,
 * you have to pass a valid RegExp object to make this feature work.
 *
 * @param {String|RegExp} path     Path to register to.
 * @param {String} destination     URI of the destination.
 * @param {Object} options         Optional options:
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
 *                                 - {Integer} status: The status code of the
 *                                          redirection. May be any from 300 to
 *                                          308. Defaults to 301 (Moved
 *                                          Permamently).
 * @constructor
 */
module.exports = function(path, destination, options) {
    Base.call(this, path, options);

    if (!options) options = {};

    /**
     * The destination URI of the redirect.
     *
     * @protected
     * @var {String}
     */
    this._destination = VC.string(destination, destination);

    /**
     * The HTTP status of the redirect.
     *
     * @protected
     * @var {Integer}
     */
    this._status = StatusCodes.MOVED_PERMANENTLY;

    nepp(this);

    if (options.status)
        this._status = VC.int(options.status, 'options.status', 300, 308);
};

util.inherits(module.exports, Base);

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
    this.responseManager.writeRedirect(resp, this.status, this.destination);
};

// {{{ Getter/Setter

/**
 * The destination URI of the redirect.
 *
 * @member {String} destination
 */
nepp.createGS(module.exports.prototype, 'destination',
    function getDestination() {
        return this._destination;
    },
    function setDestination(destination) {
        this._destination = VC.string(destination, 'destination');
    }
);

/**
 * The status URI of the redirect.
 *
 * @member {String} status
 */
nepp.createGS(module.exports.prototype, 'status',
    function getStatus() {
        return this._status;
    },
    function setStatus(status) {
        this._status = VC.string(status, 'status');
    }
);

// }}}

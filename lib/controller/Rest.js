/**
 * Base controller for module.exportsful requests.
 *
 * See this as an sample controller. Derive from it to create real actions.
 *
 * @author Philipp Kemmeter
 */
var VC   = require('valuechecker'),
    http = require('http'),
    util = require('util'),
    nepp = require('nepp'),
    Base = require('./Base');

/**
 * Creates a new module.exportsful controller object.
 *
 * The filename to register to may either be a string or a RegExp object.
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
        Base.call(this, path, options);
};
util.inherits(module.exports, Base);

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
        return this.requestController.responseManagers['application/json'];
    }
);

module.exports.prototype.options = function(resp) {
    this.responseManager.writeMethodNotAllowed(resp, 'options');
};

module.exports.prototype.get = function(resp) {
    this.responseManager.writeMethodNotAllowed(resp, 'get');
};

module.exports.prototype.head = function(resp) {
    this.responseManager.writeMethodNotAllowed(resp, 'head');
};

module.exports.prototype.post = function(resp) {
    this.responseManager.writeMethodNotAllowed(resp, 'post');
};

module.exports.prototype.delete = function(resp) {
    this.responseManager.writeMethodNotAllowed(resp, 'delete');
};

module.exports.prototype.trace = function(resp) {
    this.responseManager.writeMethodNotAllowed(resp, 'trace');
};

module.exports.prototype.connect = function(resp) {
    this.responseManager.writeMethodNotAllowed(resp, 'connect');
};

/**
 * Runs the controller.
 *
 * Writes directly to the given response object.
 *
 * @param http.ServerResponse resp Server response Object. Write your data into
 *                                 this object directly.
 */
module.exports.prototype.run = function(resp) {
    VC.instance_of(resp, 'resp', http.ServerResponse);
    this[this.request.method](resp);
};

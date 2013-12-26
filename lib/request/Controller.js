/**
 * This class manages the controllers.
 *
 * Each controller may register to a URL or a set of URLs defined by an regular
 * expression.
 *
 * @module mvcfun.request.Controller
 * @author Philipp Kemmeter
 */
var Helper = require('./Helper'),
    http   = require('http'),
    util   = require('util'),
    nepp   = require('nepp'),
    _      = require('underscore'),
    regexp = require('../regexp'),
    VC     = require('valuechecker');

/**
 * Creates the new controller object.
 *
 * @constructor
 */
module.exports = function() {
    Helper.call(this);

    /**
     * Array of all controllers registered to this manager.
     *
     * @protected
     */
    this._controllers = [];

    /**
     * Cache: Maps paths to their controller.
     *
     * @protected
     */
    this._controller_cache = {};

    nepp(this);
};

util.inherits(module.exports, Helper);

/**
 * Clears the controller cache.
 */
module.exports.prototype.clearCache = function() {
    this._controller_cache = {};
};

/**
 * Adds a controller.
 *
 * @param {controller.Base} controller The controller to add.
 */
module.exports.prototype.addController = function(controller) {
    VC.instance_of(controller, 'controller', require('../controller/Base'));
    this.clearCache();
    controller._requestController = this;
    this._controllers.push(controller);
};

/**
 * Returns the controller registered for the given path.
 *
 * The controllers will be checked bottom-up, i.e. the controller added last
 * will be checked first.
 *
 * The matched controller is cached, so that the next call is O(1).
 *
 * @param {String} host Host.
 * @param {Integer} port Port.
 * @param {String} path Path.
 * @returns {controller.Base}
 */
module.exports.prototype.getController = function(host, port, path) {

    VC.string(host, 'host', false);
    VC.int(port, 'port', 0);
    VC.string(path, 'path', false);

    var equals = function(a, b) {
        return (!a || a == b || (a instanceof RegExp && a.exec(b)));
    }

    if (this._controller_cache[host] && this._controller_cache[host][port]
        && this._controller_cache[host][port][path])
        return this._controller_cache[host][port][path];

    for (var i = this._controllers.length - 1; i >= 0; --i)
        if (equals(this._controllers[i].host, host)
            && equals(this._controllers[i].port, port)
            && equals(this._controllers[i].path, path)
        ) {
            if (!this._controller_cache[host])
                this._controller_cache[host] = {};
            if (!this._controller_cache[host][port])
                this._controller_cache[host][port] = {};
            this._controller_cache[host][port][path] = this._controllers[i];
            return this._controllers[i];
        }

    return null;
};

/**
 * Removes all controllers registered to it.
 */
module.exports.prototype.removeAllControllers = function() {
    this._controllers = [];
};

/**
 * Removes a controller.
 *
 * The controller may be identified by either the instance, that had been
 * added before, or the path the controller is bound to.
 *
 * @param {controller.Base|String|RegExp} id Either controller instance or
 *                                           path.
 * @returns {Boolean} If the controller was found.
 */
module.exports.prototype.removeController = function(id) {

    // TODO
    return false;

};

/**
 * Handles request to files to be delivered.
 *
 * If a controller is registered to the given path, then its output will be
 * written to the response object.
 *
 * This emits an error, if the controller throws.
 *
 * @param {http.ServerResponse} resp    Server response Object. Write your data
 *                                      into this object directly.
 * @param {mvcfun.controller.Base} ctrl Controller to run.
 */
module.exports.prototype.run = function(resp, ctrl) {
    VC.instance_of(resp, 'resp', http.ServerResponse);
    VC.instance_of(ctrl, 'ctrl', require('../controller/Base.js'));

    try {
        ctrl.run(resp);
    } catch(err) {
        this.emit('error', err);
    }
};


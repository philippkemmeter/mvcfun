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
    VC     = require('valuechecker');

/**
 * Creates the new controller object.
 *
 * @constructor
 */
module.exports = function() {
    Helper.call(this);

    /**
     * Maps paths to their controller.
     *
     * @protected
     */
    this._controllers = {};

    nepp(this);
};

util.inherits(module.exports, Helper);

/**
 * Adds a controller.
 *
 * @param {controller.Base} controller The controller to add.
 */
module.exports.prototype.addController = function(controller) {
    VC.instance_of(controller, 'controller', require('../controller/Base'));
    var path = controller.path;
    var host = controller.host || '*';
    var port = controller.port || '*';

    controller._requestController = this;

    if (host instanceof RegExp) {
        if (!this._controllers.__RegExp)
            this._controllers.__RegExp = [];
        this._controllers.__RegExp.push(controller);
    } else {
        if (!this._controllers[host])
            this._controllers[host] = {};
        if (port instanceof RegExp) {
            if (!this._controllers[host].__RegExp)
                this._controllers[host].__RegExp = [];
            this._controllers[host].__RegExp.push(controller);
        } else {
            if (!this._controllers[host][port])
                this._controllers[host][port] = {};
            if (path instanceof RegExp) {
                if (!this._controllers[host][port].__RegExp)
                    this._controllers[host][port].__RegExp = [];
                this._controllers[host][port].__RegExp.push(controller);
            } else {
                this._controllers[host][port][path] = controller;
            }
        }
    }

};

/**
 * Returns the controller registered for the given path.
 *
 * The static (non-regexp) controllers will be checked first. Iff no static
 * controller matches perfectly the given path, the RegExp ones will be
 * checked.
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

    var equals = function(a, b, hard) {
        if (hard) return a == b;
        return (a instanceof RegExp && a.exec(b));
    }

    var _c = this._controllers;
    var hostarr = [host, '*'];
    var portarr = [port, '*'];
    var checkarr = [true, false];

    // Prio 1: host, port and path: perfect hit, then * hit
    for (var hi = 0; hi < hostarr.length; ++hi) {
        var h = hostarr[hi];
        for (var pi = 0; pi < portarr.length; ++pi) {
            var p = portarr[pi];
            if (_c[h] && _c[h][p] && _c[h][p][path]) return _c[h][p][path];
        }
    }

    // Prio 2: host and port are perfect or *, path is regex hit
    for (var hi = 0; hi < hostarr.length; ++hi) {
        var h = hostarr[hi];
        for (var pi = 0; pi < portarr.length; ++pi) {
            var p = portarr[pi];
            if (_c[h] && _c[h][p] && _c[h][p].__RegExp) {
                for (var i = 0; i < _c[h][p].__RegExp.length; ++i) {
                    if (equals(_c[h][p].__RegExp[i].path, path, false))
                        return _c[h][p].__RegExp[i];
                }
            }
        }
    }

    // Prio 3: host is perfect or *, port is regex, path is perfect
    // Prio 4: host is regex, port is perfect or *, path is perfect
    // Prio 5: As 3, but path is regex
    // Prio 6: As 4, but path is regex
    for (var ci = 0; ci < checkarr.length; ++ci) {
        var hard_check = checkarr[ci];
        for (var hi = 0; hi < hostarr.length; ++hi) {
            var h = hostarr[hi];
            if (_c[h] && _c[h].__RegExp) {
                for (var i = 0; i < _c[h].__RegExp.length; ++i) {
                    if (equals(_c[h].__RegExp[i].port, port, false)
                        && equals(_c[h].__RegExp[i].path, path, hard_check)
                    ) {
                        return _c[h].__RegExp[i];
                    }
                }
            }
        }

        if (_c.__RegExp) {
            for (var i = 0; i < _c.__RegExp.length; ++i) {
                if (equals(_c.__RegExp[i].host, host, false)) {
                    for (var pi = 0; pi < portarr.length; ++pi) {
                        var p = portarr[pi];
                        if (equals(_c.__RegExp[i].port, p, true)
                            && equals(_c.__RegExp[i].path, path, hard_check)
                        ) {
                            return _c.__RegExp[i];
                        }
                    }
                }
            }
        }
    }

    // Prio 7: path and port are regex, path is perfect
    // Prio 8: path and port and path are regex
    if (_c.__RegExp) {
        for (var ci = 0; ci < checkarr.length; ++ci) {
            var hard_check = checkarr[ci];
            for (var i = 0; i < _c.__RegExp.length; ++i) {
                if (equals(_c.__RegExp[i].host, host, false)
                    && equals(_c.__RegExp[i].port, port, false)
                    && equals(_c.__RegExp[i].port, port, hard_check)
                ) {
                    return _c.__RegExp[i];
                }
            }
        }
    }

    return null;
};

/**
 * Removes all controllers registered to it.
 */
module.exports.prototype.removeAllControllers = function() {
    this._controllers = {};
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


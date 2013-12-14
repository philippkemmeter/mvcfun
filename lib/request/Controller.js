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
     * Maps filenames to their controller.
     *
     * @protected
     */
    this._controllers = {};

    /**
     * Ordered array of regex controllers. First match found will be used..
     *
     * @protected
     */
    this._controllers_regexp = [];

    nepp(this);
};

util.inherits(module.exports, Helper);

/**
 * Adds a controller.
 *
 * @param {controller.Helper} controller The controller to add.
 */
module.exports.prototype.addController = function(controller) {
    var filename = controller.filename;

    if (filename instanceof RegExp) {
        // Add on stack, that we will search later
        this._controllers_regexp.push(VC.instance_of(
            controller, 'controller', require('../controller/Base.js')
        ));
        this._controllers_regexp[this._controllers_regexp.length - 1]
            ._requestController = this;
    } else {
        // Add to map of static files
        this._controllers[filename]
            = VC.instance_of(
                controller, 'controller', require('../controller/Base.js')
            );
        this._controllers[filename]._requestController = this;
    }

};

/**
 * Returns the controller registered for the given filename.
 *
 * The static (non-regexp) controllers will be checked first. Iff no static
 * controller matches perfectly the given filename, the RegExp ones will be
 * checked.
 *
 * @param {String} filename Filename.
 * @returns {controller.Helper}
 */
module.exports.prototype.getController = function(filename) {
    // Static file names have highest prio, always
    if (this._controllers[filename]) {
        return this._controllers[filename];
    }
    for (var i =  this._controllers_regexp.length - 1; i >= 0; --i) {
        if (this._controllers_regexp[i].filename.exec(filename))
            return this._controllers_regexp[i];
    }
    return null;
};

/**
 * Removes a controller.
 *
 * The controller may be identified by either the instance, that had been
 * added before, or the filename the controller is bound to.
 *
 * @param {controller.Helper|String|RegExp} id Either controller instance or
 *                                           filename.
 * @returns {Boolean} If the controller was found.
 */
module.exports.prototype.removeController = function(id) {
    if (id instanceof require('../controller/Base.js')) {
        var deleted = false;
        [ this._controllers_regexp, this._controllers ].forEach(
            function(elem, index, arr) {
                if (deleted) return;
                for (var i in arr[index]) {
                    if (arr[index][i].filename == id.filename) {
                        if (_.isArray(arr[index]))
                            arr[index].splice(i,1);
                        else
                            delete arr[index][i];
                        deleted = true;
                    }
                }
            }
        );
        return deleted;
    } else if (typeof(id) == 'string') {
        if (this._controllers[id]) {
            delete this._controllers[id];
            return true;
        }
    } else if (id instanceof RegExp) {
        for (var i = 0; i < this._controllers_regexp.length; ++i) {
            if (_.isEqual(this._controllers_regexp[i].filename, id)) {
                this._controllers_regexp.splice(i,1);
                return true;
            }
        }
    } else {
        throw new Error(
            "id has to be of type String, RegExp or controller.Helper; " + id +
            " given; type is " + typeof(id)
        );
    }
    return false;
};

/**
 * Handles request to files to be delivered.
 *
 * If a controller is registered to the given filename, then its output will be
 * written to the response object. Otherwise it'll be tried to load the static
 * file from hard disk and its content will be written to the reponse object.
 *
 * @param {http.ServerResponse} resp Server response Object. Write your data
 *                                   into this object directly.
 * @param {String} filename          Request path and filename.
 */
module.exports.prototype.run = function(resp, filename) {
    VC.string(filename, 'filename', true);
    VC.instance_of(resp, 'resp', http.ServerResponse);
    var c = this.getController(filename);

    if (c) {
        try {
            c.run(resp, filename);
        } catch(err) {
            this.emit('error', err);
        }
    } else
        this.responseManager.writeNotFound(resp);
};


/**
 * Diese Klasse managet die Controller.
 *
 * Controller können sich hier auf URLs registrieren.
 *
 * @author Philipp Kemmeter
 */
var Base = require('./Base.js'),
    http = require('http'),
    util = require('util'),
    FW = require('philfw'),
    ControllerBase = require('../controller/Base.js');

/**
 * Erzeugt eine neues Controller-Objekt.
 *
 * @param object session       Session data object.
 * @param LogClient log_client Client for logging.
 * @param RespMan resp_manager Response mananger.
 */
var Controller = function(session, log_client, resp_manager) {
    Base.call(this, session, log_client, resp_manager);

    // Maps filenames to their controller.
    this._controllers = {};
    // Maps the pattern to match a filename to their controller.
    this._controllers_regexp = {};
};

util.inherits(Controller, Base);

module.exports = Controller;

/**
 * Adds a controller.
 *
 * @param ControllerBase controller The controller to add.
 */
Controller.prototype.addController = function(controller) {
    var filename = controller.getFilename();
    if (filename instanceof RegExp) {
        this._controllers_regexp[filename /* autocast to string */]
            = FW.ValueChecker.instance_of(
                controller, 'controller', ControllerBase
            );
    } else {
        this._controllers[filename /* is a string anyways */]
            = FW.ValueChecker.instance_of(
                controller, 'controller', ControllerBase
            );
    }
};

/**
 * Returns the controller registered for the given filename.
 *
 * The static (non-regexp) controllers will be checked first. Iff no static
 * controller matches perfectly the given filename, the RegExp ones will be
 * checked.
 *
 * @param string filename Filename.
 * @return ControllerBase|null
 */
Controller.prototype.getController = function(filename) {
    if (this._controllers[filename])
        return this._controllers[filename];
    for (i in this._controllers_regexp) {
        if (this._controllers_regexp[i].getFilename().exec(filename))
            return this._controllers_regexp[i];
    }
    return null;
};

/**
 * Handles request to files to be delivered.
 *
 * If a controller is registered to the given filename, then its output will be
 * written to the response object. Otherwise it'll be tried to load the static
 * file from hard disk and its content will be written to the reponse object.
 *
 * @param String filename          Request path and filename.
 * @param String method            The method (POST or GET etc).
 * @param object data              Statics won't receive any params.
 * @param http.ServerResponse resp Server response Object. Write your data into
 *                                 this object directly.
 */
Controller.prototype.run = function(filename, method, data, resp) {
    FW.ValueChecker.string(filename, 'filename', true);
    FW.ValueChecker.instance_of(resp, 'resp', http.ServerResponse);
    var c = this.getController(filename);

    if (c)
        c.run(this._session, method, data, resp, filename);
    else
        this._resp_manager.writeNotFound(resp);
};

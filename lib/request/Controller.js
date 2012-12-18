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
    FW = require('../FW/'),
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
};

util.inherits(Controller, Base);

module.exports = Controller;

/**
 * Adds a controller.
 *
 * @param CcontrollerBase controller The controller to add.
 */
Controller.prototype.addController = function(controller) {
    this._controllers[controller.getFilename()] = FW.ValueChecker.instance_of(
        controller, 'controller', ControllerBase
    );
};

/**
 * Returns the controller registered for the given filename.
 *
 * @param string filename Filename.
 * @return ControllerBase
 */
Controller.prototype.getController = function(filename) {
    return this._controllers[filename];
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
    var c;

    if (c = this.getController(filename))
        c.run(this._session, method, data, resp);
    else {
        this._resp_manager.writeNotFound(resp);
    }
};

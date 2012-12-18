/**
 * Basisklasse aller Controller.
 *
 * @author Philipp Kemmeter
 */
var FW = require('../FW/'),
    http = require('http'),
    RespMan = require('../response/Manager.js'),
    HTTPStatusCodes = require('../HTTPStatusCodes');

/**
 * Creates a new Base object.
 *
 * The filename to register to may either be a string or a RegExp object.
 * Please note, that a pattern as a string will NOT work for pattern matching,
 * you have to pass a valid RegExp object to make this feature work.
 *
 * @param string|RegExp filename Filename to register to.
 * @param RespMan resp_manager Response mananger.
 */
var Base = function(filename, resp_manager) {
    try {
        this._filename = FW.ValueChecker.instance_of(
            filename, 'filename', RegExp
        );
    } catch (e) {
        this._filename = FW.ValueChecker.string(filename, 'filename', true);
    }
    this._resp_manager = FW.ValueChecker.instance_of(
        resp_manager, 'resp_manager', RespMan
    );
};

module.exports = Base;

/**
 * Returns the filename.
 *
 * @return string|RegExp
 */
Base.prototype.getFilename = function() {
    return this._filename;
};

/**
 * Returns the response manager.
 *
 * @return RespMan
 */
Base.prototype.getResponseManager = function() {
    return this._resp_manager;
};

/**
 * Runs the controller.
 *
 * Writes directly to the given response object.
 *
 * @param object session           The sessin object.
 * @param String method            The method (POST or GET etc).
 * @param object data              Statics won't receive any params.
 * @param http.ServerResponse resp Server response Object. Write your data into
 *                                 this object directly.
 */
Base.prototype.run = function(session, method, data, resp) {
    FW.ValueChecker.instance_of(resp, 'resp', http.ServerResponse);
    resp.writeHead(HTTPStatusCodes.OK,
        {'Content-Type': 'text/plain'}
    );
    resp.end(method + JSON.stringify(data));
};

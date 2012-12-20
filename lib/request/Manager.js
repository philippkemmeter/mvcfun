/**
 * This object manages the request.
 *
 * It's the first address and decides, what kind of response we have and which
 * handler is to be called.
 *
 * @author Philipp Kemmeter
 */
var Base = require('./Base.js'),
    Api = require('./Api.js'),
    Controller = require('./Controller.js'),
    Directory = require('./Directory.js'),
    File = require('./File.js'),
    UploadManager = require('../UploadManager.js'),
    API = require('../API.js'),
    http = require('http'),
    FW = require('../FW/'),
    util = require('util');

/**
 * Creates a new Manager instance.
 *
 * @param object session       Session data object.
 * @param LogClient log_client Client for logging.
 * @param RespMan resp_manager Response mananger.
 */
var Manager = function(session, log_client, resp_manager) {
    Base.call(this, session, log_client, resp_manager);
    this._api_man = new Api(session, log_client, resp_manager);
    this._api_man.setApi(API);
    this._controller_man = new Controller(session, log_client, resp_manager);
    this._directory_man = new Directory(session, log_client, resp_manager);
    this._file_man = new File(session, log_client, resp_manager);

    this._upload_manager = null;
};

util.inherits(Manager, Base);
module.exports = Manager;

/**
 * Handles request to files to be delivered.
 *
 * @param String filename          Request path and filename.
 * @param String method            The method (POST or GET etc).
 * @param object data              Statics won't receive any params.
 * @param http.ServerResponse resp Server response Object. Write your data into
 *                                 this object directly.
 */
Manager.prototype.run = function(filename, method, data, resp) {
    FW.ValueChecker.string(filename, 'filename', true);
    FW.ValueChecker.instance_of(resp, 'resp', http.ServerResponse);

    if (this.getControllerManager().getController(filename))
        this.getControllerManager().run(filename, method, data, resp);
    else if (filename.charAt(filename.length - 1) == '/')
        this.getDirectoryManager().run(filename, method, data, resp);
    else if (method == 'POST')
        this.getApiManager().run(filename, method, data, resp);
    else if (filename == '' || filename.search('\\.') != -1)
        // We distinguish file request from api GET commands by the appearance
        // or a dot in the request name.
        // Therefore it's not possible to serve static files not containing any
        // dot in its name.
        this.getFileManager().run(filename, method, data, resp);
    else
        this.getApiManager().run(filename, method, data, resp);

};

/**
 * Handles the upload.
 */
Manager.prototype._handleUpload = function(req, resp) {
    var _this = this;
    var auth = new Auth(this.getSession());
    auth.check_auth(function(err) {
        if (err) {
            _this.getResponseManager().writeUnauthorized(resp);
        } else {
            _this.__handleUpload();
        }
    });
};

/**
 * Helper for the upload handling.
 */
Manager.prototype.__handleUpload = function(req, resp) {
    if (!this._upload_manager) {
        this._upload_manager = new UploadManager(
            req, resp, this._log_client
        );
    }

    _this = this;
    this._upload_manager.handleUpload(
        function(err, result) {
            _this._uploadCallback(err, result);
        }
    );
};

Manager.prototype._uploadCallback = function(err, result) {
    if (err)
        result = {'error': err}
    else
        result = {'success' : true}

    this.getResponseManager().writeJson(result);
};

/**
 * Sets the session object.
 *
 * @param object session Session.
 */
Manager.prototype.setSession = function(session) {
    Base.prototype.setSession.call(this, session);
    this._api_man.setSession(session);
    this._controller_man.setSession(session);
    this._directory_man.setSession(session);
    this._file_man.setSession(session);
};

Manager.prototype.getApiManager = function() {
    return this._api_man;
};

Manager.prototype.getControllerManager = function() {
    return this._controller_man;
};

Manager.prototype.getDirectoryManager = function() {
    return this._directory_man;
};

Manager.prototype.getFileManager = function() {
    return this._file_man;
};

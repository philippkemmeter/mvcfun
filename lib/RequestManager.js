/**
 * Diese Klasse behandelt Server-Anfragen.
 *
 * @author Philipp Kemmeter
 */
var http = require('http'),
    HTTPStatusCodes = require('./HTTPStatusCodes.js'),
    util = require('util'),
    Formidable = require('formidable'),
    url = require('url'),
    path = require('path'),
    API = require('./API.js'),
    FW = require('./FW/'),
    Config = require('./Config.js'),
    Mime = require('./Mime.js'),
    LogClient = require('./LogClient.js'),
    UploadManager = require('./UploadManager.js'),
    ErrorCodes = require('./ErrorCodes.js');

/* not used
var read_files = function(file_paths, cb, c) {
    var f = file_paths.shift();
    if (typeof(c) == 'undefined') {
        c = '';
    }
    fs.readFile(f, function(error, content) {
        if (error) {
            cb(error, content);
        } else {
            c += content;
            if (file_paths.length == 0) {
                cb(error, c);
            } else {
                read_files(file_paths, cb, c);
            }
        }
    });
};*/

/**
 * Erzeugt eine neues RequestManager-Objekt.
 *
 * @param http.ClientRequest req   Request-Objekt.
 * @param http.ClientResponse resp Response-Objekt.
 * @param LogClient log_client     Client zum Loggen.
 */
var RequestManager = function(req, resp, log_client) {
    this._upload_manager = null;
    this._file_manager = null;
    this._api_manager = null;
};

module.exports = RequestManager;

/**
 * Logs the message via the log client.
 *
 * @param string message Message to log
 */
RequestManager.prototype.log = function(message) {
    this._log_client.log(message);
};

/**
 * Handles the upload.
 */
RequestManager.prototype.handleUpload = function() {
    var _this = this;
    var auth = new Auth(this._req.session);
    auth.check_auth(function(err) {
        if (err) {
            _this._resp.writeHead(
                HTTPStatusCodes.UNAUTHORIZED,
                {'content-type': 'text/plain'}
            );
            _this._resp.end('Authorization Required');
        } else {
            _this._handleUpload();
        }
    });
};

/**
 * Helper for the upload handling.
 */
RequestManager.prototype._handleUpload = function() {
    if (!this._upload_manager) {
        this._upload_manager = new UploadManager(
            this._req, this._resp, this._log_client
        );
    }

    _this = this;
    this._upload_manager.handleUpload(
        function(err, result) {
            _this._uploadCallback(err, result);
        }
    );
};

RequestManager.prototype._uploadCallback = function(err, result) {
    if (err)
        result = {'error': err}
    else
        result = {'success' : true}

    this._jsonCallback(result);
};

RequestManager.prototype._jsonCallback = function(res) {
    try {
        this._resp.writeHead(
            HTTPStatusCodes.OK,
            {'Content-Type': 'application/json;charset=utf-8'}
        );
        this._resp.end(JSON.stringify(res));

//        if (Config.DEBUG_LEVEL > 0)
            console.log(JSON.stringify(res));
    }
    catch(e) {
        this._resp.writeHead(
            HTTPStatusCodes.INTERNAL_SERVER_ERROR,
            {'Content-Type': 'text/plain'}
        );
        this.log(e);
        this._resp.end('Internal Server Error');
    }
};


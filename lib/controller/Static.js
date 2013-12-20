/**
 * This controller is for serving static files.
 *
 * @module mvcfun.controller.Static
 * @author Philipp Kemmeter <phil.kemmeter@gmail.com>
 */
var Base            = require('./Base'),
    http            = require('http'),
    HTTPStatusCodes = require('../http/StatusCodes'),
    util            = require('util'),
    url             = require('url'),
    fs              = require('fs'),
    VC              = require('valuechecker'),
    nepp            = require('nepp'),
    Mime            = require('../Mime'),
    ErrorCodes      = require('../ErrorCodes');

/**
 * Creates a new Static object.
 *
 * The path to register to may either be a string or a RegExp object.
 * Please note, that a pattern as a string will NOT work for pattern matching,
 * you have to pass a valid RegExp object to make this feature work.
 *
 * @param {String|RegExp} path     Path to register to.
 * @param {Object} options         Options:
 *                                 - {String} htdocsDir:    The files to serve
 *                                          are relative to this directory.
 *                                          Defaults to './htdocs'.
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

    if (!options) options = {};

    /**
     * Directory where the htdocs are located.
     *
     * @var {String}
     * @protected
     */
    this._htdocsDir = '';

    nepp(this);

    this.htdocsDir = options.htdocsDir || './htdocs';
};

util.inherits(module.exports, Base);

/**
 * Serve static files on the filesystem. Controller are not checked.
 * The header (especially the content type) is always determined by the
 * path provided.
 *
 * @param {http.ServerResponse} resp Server response Object. Write your data
 *                                   into this object directly.
 */
module.exports.prototype.run = function(resp) {
    if (this.request.method != 'GET') {
        this.responseManager.writeMethodNotAllowed(
            resp, this.request.method, this.language
        );
        return;
    }

    this._serveStatic(
        this.htdocsDir + this.request.path,
        VC.instance_of(resp, 'resp', http.ServerResponse)
    );
};

/**
 * Helper for run.
 *
 * @param {String} path          File to serve.
 * @param {http.ServerResponse} resp Server response Object. Write your data
 *                                   into this object directly.
 * @protected
 */
module.exports.prototype._serveStatic = function(path, resp) {
    var _this = this;
    var mime = new Mime(path);

    fs.exists(path, function(exists) {
        if (exists) {
            var header = {
                'Content-Type': mime.contentType
            };
            if (_this.language) {
                header['Content-Language'] = _this.language;
            }
            if (mime.mime == 'image') {
                fs.stat(path, function(err, stat) {
                    if (err)
                        _this.emit('error', err);
                    else {
                        header['Content-Length'] = stat.size;
                        resp.writeHead(HTTPStatusCodes.OK, header);

                        var rs = fs.createReadStream(path);
                        rs.pipe(resp);
                        rs.on('error', function(err) {
                            _this.emit('error', err);
                        });
                    }
                });
            } else {
                fs.readFile(path, function(err, content) {
                    if (err) {
                        _this.emit('error', err);
                        _this.responseManager.writeInternalServerError(
                            resp, err, _this.language
                        );
                    } else {
                        resp.writeHead(HTTPStatusCodes.OK, header);
                        resp.end(content, 'utf-8');
                    }
                });
            }
        } else {
            _this.responseManager.writeNotFound(resp, path, _this.language);
        }
    });
};

/**
 * The htdocs dir.
 *
 * @member {String} htdocsDir
 */
nepp.createGS(module.exports.prototype, 'htdocsDir',
    function getHtdocsDir() {
        return this._htdocsDir;
    },
    function setHtdocsDir(dir) {
        this._htdocsDir = VC.string(dir, 'dir');
    }
);

nepp(module.exports.prototype);

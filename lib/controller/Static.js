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
 * The filename to register to may either be a string or a RegExp object.
 * Please note, that a pattern as a string will NOT work for pattern matching,
 * you have to pass a valid RegExp object to make this feature work.
 *
 * @param {String|RegExp} filename Filename to register to.
 * @param {Object} options         Options:
 *                                 - htdocsDir: The files to serve are relative
 *                                              to this directory. Defaults to
 *                                              './htdocs'.
 * @constructor
 */
module.exports = function(filename, options) {
    Base.call(this, filename, options);

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
 * filename provided.
 *
 * @param {String} method            IGNORED. The method (POST or GET etc).
 * @param {http.ServerResponse} resp Server response Object. Write your data
 *                                   into this object directly.
 * @param {String} path              Fully qualified path to requested object.
 */
module.exports.prototype.run = function(method, resp, path) {
    VC.string(path, 'path', true);
    VC.instance_of(resp, 'resp', http.ServerResponse);
    var path = this.htdocsDir + path;

    this._serveStatic(path, resp);
};

/**
 * Helper for run.
 *
 * @param {String} filename          File to serve.
 * @param {http.ServerResponse} resp Server response Object. Write your data
 *                                   into this object directly.
 * @protected
 */
module.exports.prototype._serveStatic = function(filename, resp) {
    var _this = this;
    var mime = new Mime(filename);

    fs.exists(filename, function(exists) {
        if (exists) {
            var header = {
                'Content-Type': mime.contentType
            };
            if (_this.language) {
                header['Content-Language'] = _this.language;
            }
            if (mime.mime == 'image') {
                fs.stat(filename, function(err, stat) {
                    if (err)
                        _this.emit('error', err);
                    else {
                        header['Content-Length'] = stat.size;
                        resp.writeHead(HTTPStatusCodes.OK, header);

                        var rs = fs.createReadStream(filename);
                        rs.pipe(resp);
                        rs.on('error', function(err) {
                            _this.emit('error', err);
                        });
                    }
                });
            } else {
                fs.readFile(filename, function(err, content) {
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
            _this.responseManager.writeNotFound(resp, filename, _this.language);
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

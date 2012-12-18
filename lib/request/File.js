/**
 * This object serves static files.
 *
 * @author Philipp Kemmeter
 */
var Base = require('./Base.js'),
    Auth = require('../Auth.js'),
    http = require('http'),
    HTTPStatusCodes = require('../HTTPStatusCodes.js'),
    util = require('util'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    FW = require('../FW/'),
    Config = require('../Config.js'),
    Mime = require('../Mime.js'),
    RespMan = require('../response/Manager.js');
    ErrorCodes = require('../ErrorCodes.js');

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
 * Creates a new File object.
 *
 * @param object session       Session data object.
 * @param LogClient log_client Client for logging.
 * @param RespMan resp_manager Response manager.
 */
var File = function(session, log_client, resp_manager) {
    Base.call(this, session, log_client, resp_manager);
    this._htdocs_dir = Config.HTDOCS_DIR;
};

util.inherits(File, Base);

module.exports = File;

/**
 * Serve static files on the filesystem. Controller are not checked.
 * The header (especially the content type) is always determined by the
 * filename provided.
 *
 * @param String filename          Request path and filename.
 * @param String method            IGNORED. The method (POST or GET etc).
 * @param object data              IGNORED. Statics won't receive any params.
 * @param http.ServerResponse resp Server response Object. Write your data into
 *                                 this object directly.
 */
File.prototype.run = function(filename, method, data, resp) {
    FW.ValueChecker.string(filename, 'filename', true);
    FW.ValueChecker.instance_of(resp, 'resp', http.ServerResponse);
    var _this = this;
    var filename = this.getHtdocsDir() + '/' + ((filename == '/')
        ? 'html/index.html'
        : filename);

    if (filename.indexOf('/protected/') > -1) {
        var auth = new Auth(this._req.session);
        auth.check_auth(function(err) {
            if (err) {
                this._resp_manager.writeUnauthorized(resp);
            } else {
                _this._serveStatic(filename, resp);
            }
        });
    } else {
        this._serveStatic(filename, resp);
    }
};

/**
 * Helper for run.
 *
 * @param string filename          File to serve.
 * @param http.ServerResponse resp Server response Object. Write your data into
 *                                 this object directly.
 */
File.prototype._serveStatic = function(filename, resp) {
    var _this = this;
    var urlo = url.parse(filename);
    query_string = urlo.search;
    filename = urlo.pathname;

    var mime = new Mime(filename);

	path.exists(filename, function(exists) {
		if (exists) {
			if (mime.getMime() == 'image') {
				fs.stat(filename, function(err, stat) {
					if (err) {
						console.log(err);
						_this.log(err);
					} else {
						resp.writeHead(HTTPStatusCodes.OK, {
                            'Content-Type': mime.getContentType(),
                            'Content-Length': stat.size
                        });

						var rs = fs.createReadStream(filename);

						util.pump(rs, resp, function(err) {
							if (err) {
								console.log(err);
								_this.log(err);
							}
						});
					}
				});
			} else {
                fs.readFile(filename, function(error, content) {
                    if (error) {
                        _this._resp_manager.writeInternalServerError(
                            resp, error
                        );
                    } else {
                        resp.writeHead(HTTPStatusCodes.OK, {
                            'Content-Type': mime.getContentType()
                        });
                        resp.end(content, 'utf-8');
                    }
                });
            }
		} else {
            _this._resp_manager.writeNotFound(resp);
		}
	});
};

/**
 * Returns the htdocs dir.
 *
 * @return String
 */
File.prototype.getHtdocsDir = function() {
    return this._htdocs_dir;
};

/**
 * Sets the htdocs dir.
 *
 * @param String dir The dir.
 */
File.prototype.setHtDocsDir = function(dir) {
    this._htdocs_dir = FW.ValueChecker.string(dir, 'dir');
};

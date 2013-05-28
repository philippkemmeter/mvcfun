/**
 * Handler with response wrappers.
 *
 * @module mvcfun.response.Manager
 * @author Philipp Kemmeter
 */
var http            = require('http'),
    VC              = require('valuechecker'),
    HTTPStatusCodes = require('../http/StatusCodes.js'),
    EventEmitter    = require('events').EventEmitter,
    util            = require('util'),
    nepp            = require('nepp');

/**
 * Creates a new response manager.
 *
 * @param {String} options      Options:
 *                              - charset: The charset to set in header for all
 *                                         responses. May be changed later.
 * @constructor
 */
module.exports = function(options) {
    /**
     * Charset to use.
     *
     * @var {String}
     * @protected
     */
    this._charset = '';

    this.charset = (options && options.charset) || 'utf-8';

    nepp(this);
};

util.inherits(module.exports, EventEmitter);

/**
 * Writes HTML to the response object.
 *
 * @param {http.ServerResponse} resp Reponse Object.
 * @param {String} content           The HTML string to write.
 */
module.exports.prototype.writeHTML = function(resp, content) {
    VC.instance_of(resp, 'resp', http.ServerResponse);
    VC.string(content, 'content', true);
    try {
        resp.writeHead(
            HTTPStatusCodes.OK,
            {'Content-Type': 'text/html; charset=' + this.charset}
        );
        resp.end(content);
    } catch (e) {
        this.writeInternalServerError(resp, e);
    }
};

/**
 * Writes an object as JSON string to the response object.
 *
 * @param {http.ServerResponse} resp Reponse Object.
 * @param {Object} res               Object to write.
 */
module.exports.prototype.writeJSON = function(resp, res) {
    VC.instance_of(resp, 'resp', http.ServerResponse);
    VC.instance_of(res, 'res', Object);
    try {
        resp.writeHead(
            HTTPStatusCodes.OK,
            {'Content-Type': 'application/json; charset=' + this.charset}
        );
        resp.end(JSON.stringify(res));
    } catch (e) {
        this.writeInternalServerError(resp, e);
    }
};

/**
 * Writes plain text to the response object.
 *
 * @param {http.ServerResponse} resp Response Object.
 * @param {String} content           The content to write.
 */
module.exports.prototype.writeText = function(resp, content) {
    VC.instance_of(resp, 'resp', http.ServerResponse);
    VC.string(content, 'content', true);
    try {
        resp.writeHead(
            HTTPStatusCodes.OK,
            {'Content-Type': 'text/plain; charset=' + this.charset}
        );
        resp.end(content);
    } catch (e) {
        this.writeInternalServerError(resp, e);
    }
};

/**
 * Writes an internal server error to the response object.
 *
 * @param {http.ServerResponse} resp Reponse Object.
 * @param {Array} err                Error array. Will be logged.
 */
module.exports.prototype.writeInternalServerError = function(resp, err) {
    VC.instance_of(resp, 'resp', http.ServerResponse);
    resp.writeHead(
        HTTPStatusCodes.INTERNAL_SERVER_ERROR,
        {'Content-Type': 'text/plain; charset=' + this.charset}
    );
    resp.end('Internal Server Error');
};

/**
 * Writes forbidden to the response object.
 *
 * @param {http.ServerResponse} resp Reponse Object.
 */
module.exports.prototype.writeForbidden = function(resp) {
    VC.instance_of(resp, 'resp', http.ServerResponse);
    resp.writeHead(
        HTTPStatusCodes.FORBIDDEN,
        {'Content-Type': 'text/plain; charset=' + this.charset}
    );
    resp.end('Forbidden');
};

/**
 * Write not found to the reponse object.
 *
 * @param {http.ServerResponse} resp Reponse Object.
 * @param {String} filename          Filename.
 */
module.exports.prototype.writeNotFound = function(resp, filename) {
    VC.instance_of(resp, 'resp', http.ServerResponse);
    resp.writeHead(
        HTTPStatusCodes.NOT_FOUND,
        {'Content-Type': 'text/plain; charset=' + this.charset}
    );
    if (filename) {
        resp.end('File "' + VC.string(filename, 'filename') + '" not found');
    } else {
        resp.end('File not found');
    }
};

/**
 * Writes unauthorized to the response object.
 *
 * @param {http.ServerResponse} resp Reponse Object.
 */
module.exports.prototype.writeUnauthorized = function(resp) {
    VC.instance_of(resp, 'resp', http.ServerResponse);
    resp.writeHead(
        HTTPStatusCodes.UNAUTHORIZED,
        {'Content-Type': 'text/plain; charset=' + this.charset}
    );
    resp.end('Authorization Required');
};

/**
 * Writes method not allowed.
 *
 * @param {http.ServerResponse} resp Response Object.
 * @param {String} method            Tried method.
 */
module.exports.prototype.writeMethodNotAllowed = function(resp, method) {
    VC.instance_of(resp, 'resp', http.ServerResponse);
    resp.writeHead(
        HTTPStatusCodes.METHOD_NOT_ALLOWED,
        {'Content-Type': 'text/plain; charset=' + this.charset}
    );
    if (method) {
        resp.end('Method not allowed: ' + VC.string(method, 'method'));
    } else {
        resp.end('Method not allowed');
    }
};

/**
 * The charset that will be used for all responses.
 *
 * @member {String} charset
 */
nepp.createGS(module.exports.prototype, 'charset',
    function getCharset() {
        return this._charset;
    },
    function setCharset(charset) {
        this._charset = VC.string(charset, 'charset').toLowerCase();
    }
);

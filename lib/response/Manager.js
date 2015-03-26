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
 *        - charset:     The charset to set in header for all responses. May be
 *                       changed later.
 *        - contentType: The content type this manager will use to respond.
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

    /**
     * Content type to use.
     *
     * @var {String}
     * @protected
     */
    this._contentType = '';

    this.charset     = (options && options.charset) || 'utf-8';
    this.contentType = (options && options.contentType) || 'text/plain';

    nepp(this);
};

util.inherits(module.exports, EventEmitter);

/**
 * Creates the header for the response.
 *
 * @param {String} language     Language value. Either empty or 2 letters long.
 * @return {Object}
 */
module.exports.prototype._createHeader = function(language) {
    var header = {};

    if (language) {
        VC.string(language, 'language', false, 2, 2);
        header['Content-Language'] = language;
    }

    header['Content-Type'] = this.contentType + '; charset=' + this.charset;
    return header;
};

/**
 * Prepares the error message before it's being sent to the client.
 *
 * @param {String} message Message to be prepared.
 * @return {String}
 */
module.exports.prototype._prepareErrorMessage = function(message) {
    return message;
};

/**
 * Writes HTML to the response object.
 *
 * @param {http.ServerResponse} resp Reponse Object.
 * @param {String} content           The HTML string to write.
 * @param {String} language          The language of the content.
 */
module.exports.prototype.write = function(resp, content, language) {
    VC.instance_of(resp, 'resp', http.ServerResponse);
    VC.string(content, 'content', true);
    try {
        resp.writeHead(
            HTTPStatusCodes.OK,
            this._createHeader(language)
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
 * @param {String} language          The language of the content.
 */
module.exports.prototype.writeInternalServerError = function(resp, err,
    language)
{
    VC.instance_of(resp, 'resp', http.ServerResponse);
    resp.writeHead(
        HTTPStatusCodes.INTERNAL_SERVER_ERROR,
        this._createHeader(language)
    );
    resp.end(this._prepareErrorMessage('Internal Server Error'));
};

/**
 * Writes forbidden to the response object.
 *
 * @param {http.ServerResponse} resp Reponse Object.
 * @param {String} language          The language of the content.
 */
module.exports.prototype.writeForbidden = function(resp, language) {
    VC.instance_of(resp, 'resp', http.ServerResponse);
    resp.writeHead(
        HTTPStatusCodes.FORBIDDEN,
        this._createHeader(language)
    );
    resp.end(this._prepareErrorMessage('Forbidden'));
};

/**
 * Write not found to the reponse object.
 *
 * @param {http.ServerResponse} resp Reponse Object.
 * @param {String} filename          Filename.
 * @param {String} language          The language of the content.
 */
module.exports.prototype.writeNotFound = function(resp, filename, language) {
    VC.instance_of(resp, 'resp', http.ServerResponse);
    resp.writeHead(
        HTTPStatusCodes.NOT_FOUND,
        this._createHeader(language)
    );

    var errorMsg = (filename)
        ? 'File "' + VC.string(filename, 'filename') + '" not found'
        : 'File not found';
    resp.end(this._prepareErrorMessage(errorMsg));
};

/**
 * Writes unauthorized to the response object.
 *
 * @param {http.ServerResponse} resp Reponse Object.
 * @param {String} language          The language of the content.
 */
module.exports.prototype.writeUnauthorized = function(resp, language) {
    VC.instance_of(resp, 'resp', http.ServerResponse);
    resp.writeHead(
        HTTPStatusCodes.UNAUTHORIZED,
        this._createHeader(language)
    );
    resp.end(this._prepareErrorMessage('Authorization Required'));
};

/**
 * Writes method not allowed.
 *
 * @param {http.ServerResponse} resp Response Object.
 * @param {String} method            Tried method.
 * @param {String} language          The language of the content.
 */
module.exports.prototype.writeMethodNotAllowed = function(resp, method,
    language)
{
    VC.instance_of(resp, 'resp', http.ServerResponse);
    resp.writeHead(
        HTTPStatusCodes.METHOD_NOT_ALLOWED,
        this._createHeader(language)
    );

    var errorMsg = (method)
        ? 'Method not allowed: ' + VC.string(method, 'method')
        : 'Method not allowed';

    resp.end(this._prepareErrorMessage(errorMsg));
};

/**
 * Writes a redirect (http status and location header).
 *
 * @param {http.ServerResponse} resp Response object.
 * @param {String} uri               Uri to direct to.
 */
module.exports.prototype.writeRedirect = function(resp, status, uri) {
    VC.instance_of(resp, 'resp', http.ServerResponse);
    resp.writeHead(status, {Location: uri});
    resp.end();
};

/**
 * Writes a 301 redirect (moved permanently).
 *
 * @param {http.ServerResponse} resp Response Object.
 * @param {String} uri               Uri to direct to.
 */
module.exports.prototype.writeMovedPermanently = function(resp, uri) {
    this.writeRedirect(resp, HTTPStatusCodes.MOVED_PERMANENTLY, uri);
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

/**
 * The content type that will be used for all responses.
 *
 * @member {String} contentType
 */
nepp.createGS(module.exports.prototype, 'contentType',
    function getContentType() {
        return this._contentType;
    },
    function setContentType(contentType) {
        this._contentType = VC.string(contentType, 'contentType').toLowerCase();
    }
);

nepp(module.exports.prototype);

/**
 * Returns the mime type of a filename.
 *
 * @module mvcfun.Mime
 * @author Philipp Kemmeter
 */

var path = require('path'),
    nepp = require('nepp'),
    VC   = require('valuechecker');

/**
 * Creates a new mime object for the given filename.
 *
 * @param {String} filename.
 * @constructor
 */
module.exports = function(filename) {
    VC.string(filename, 'filename');

    this._contentType = '';
    this._mime        = '';

    var ext = path.extname(filename).substring(1);
    if (ext == 'jpg') {
        ext = 'jpeg';
    } else if (ext == 'htm') {
        ext = 'html';
    } else if (ext == 'mpg') {
        ext = 'mpeg';
    }

    switch (ext) {
        case 'js':
            this._contentType = 'text/javascript';
            this._mime        = 'text';
            break;
        case 'html':
        case 'css':
            this._contentType = 'text/' + ext;
            this._mime        = 'text';
            break;
        case 'jpeg':
        case 'gif':
        case 'png':
            this._contentType = 'image/' + ext;
            this._mime        = 'image';
            break;
        case 'mov':
        case 'avi':
        case 'mpeg':
            this._contentType = 'video/' + ext;
            this._mime        = 'video';
            break;
        case 'json':
            this._contentType = 'application/' + ext;
            this._mime        = 'application';
            break;
        default:
            this._contentType = 'text/plain';
            this._mime        = 'text';
    }
};

/**
 * Content type of owned filename.
 *
 * @member {String} contentType
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'contentType',
    function getContentType() {
        return this._contentType;
    }
);

/**
 * Mime type of owned filename.
 *
 * @member {String} mime
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'mime',
    function getMime() {
        return this._mime;
    }
);

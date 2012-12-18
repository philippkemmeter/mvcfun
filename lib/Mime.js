var path = require('path'),
    FW = require('./FW/');

var Mime = function(file_name) {
    FW.ValueChecker.string(file_name, 'file_name');

    var ext = path.extname(file_name).substring(1);
    if (ext == 'jpg') {
        ext = 'jpeg';
    } else if (ext == 'htm') {
        ext = 'html';
    } else if (ext == 'mpg') {
        ext = 'mpeg';
    }

    switch (ext) {
        case 'js':
            this._content_type = 'text/javascript';
            this._mime = 'text';
            break;
        case 'html':
        case 'css':
            this._content_type = 'text/' + ext;
            this._mime = 'text';
            break;
        case 'jpeg':
        case 'gif':
        case 'png':
            this._content_type = 'image/' + ext;
            this._mime = 'image';
            break;
        case 'mov':
        case 'avi':
        case 'mpeg':
            this._content_type = 'video/' + ext;
            this._mime = 'video';
            break;
        case 'json':
            this._content_type = 'application/' + ext;
            this._mime = 'application';
            break;
        default:
            this._content_type = 'text/plain';
            this._mime = 'text';
    }
};

module.exports = Mime;

Mime.prototype.getContentType = function() {
    return this._content_type;
};

Mime.prototype.getMime = function() {
    return this._mime;
}

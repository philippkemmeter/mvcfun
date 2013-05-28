/**
 * All error codes are listet here. The HTTP error codes are merged with them
 * as well.
 *
 * @author Philipp Kemmeter
 */
var HTTPStatusCodes = require('./http/StatusCodes.js');

exports.UNKNOWN = -1;
exports.NONE = 0;
exports.ILLEGAL_ARGUMENT = 1;
exports.LOGIN_FAILED = 2;
exports.AUTH_FAILED = 3;
exports.NOT_SUPPORTED = 4;
exports.WRONG_CONTENT_TYPE = 104;
exports.UPLOAD_SIZE_LIMIT_EXCEEDED = 105;

// Adding HTTP Error codes. So 400-599 are reserved for HTTP.
for (var i in HTTPStatusCodes) {
    if (HTTPStatusCodes[i] >= 400)
        exports[i] = HTTPStatusCodes[i];
}

/**
 * This objects contains the data of one request.
 *
 * @module mvcfun.request.Data
 * @author Philipp Kemmeter
 */
var nepp = require('nepp'),
    http = require('http'),
    url  = require('url'),
    VC   = require('valuechecker');

/**
 * Constructs the data object.
 *
 * @param {http.IncomingMessage} req The request object.
 * @param {String} rawBody           Raw body.
 * @constructor
 */
module.exports = function(req, rawBody) {
    VC.instance_of(req, 'req', http.IncomingMessage);
    /**
     * Contains the raw (not parsed) body aka post data.
     *
     * @var {String}
     * @protected
     */
    this._rawBody = VC.string(rawBody, 'rawBody', true);

    /**
     * Contains the parsed body aka post data as key-value simple object.
     *
     * @var {Object}
     * @protected
     */
    this._body = null;

    try {
        this._body = this._parse_body(rawBody);
    } catch (e) {
        this._body = null;
    }

    /**
     * Contains the request query string parsed as key-value simple object.
     *
     * @var {Object}
     * @protected
     */
    this._query = {};

    /**
     * Contains the request path.
     *
     * @var {String}
     * @protected
     */
    this._path = '';

    if (req.url) {
        var tmp = url.parse(req.url, true);
        this._query = tmp.query || {};
        this._path = tmp.pathname || '';
    }

    /**
     * Contains the HTTP request headers as a key-value simple object.
     *
     * The keys are lowercased, the values are plain.
     * Some of the headers are extracted and/or interpreted and stored in their
     * own member variable; e.g. host and port.
     *
     * @var {Object}
     * @protected
     */
    this._headers = req.headers || {};

    /**
     * Contains the host the request was sent to, e.g. 'localhost' or
     * 'www.example.org' or '123.435.234.32'.
     *
     * @var {String}
     * @protected
     */
    this._host = '';

    /**
     * Contains the port the request was sent to. Defaults to 80.
     *
     * @var {Number}
     * @protected
     */
    this._port = 0;

    if (req.headers.host) {
        var tmp = req.headers.host.split(':');
        this._host = tmp[0];
        this._port = tmp[1] ? parseInt(tmp[1]) : 80;
    }

    /**
     * Contains the request method (GET, POST ...)
     *
     * @var {String}
     * @protected
     */
    this._method = req.method;

    nepp(this);
};

/**
 * Parses the body.
 *
 * @param {String} rawBody The raw body to parse.
 * @returns {Object}
 * @throws {Error} if it could not be parsed at all.
 * @protected
 */
module.exports.prototype._parse_body = function(rawBody) {
    return JSON.parse(VC.string(rawBody, 'rawBody'));
};

// {{{ Getter/Setter

/**
 * The query as object of the current request, i.e. the parsed query string.
 *
 * @member {Object} query
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'query',
    function getQuery() {
        return this._query;
    }
);

/**
 * The path requested (without query string and without fragment).
 *
 * @member {Object} path
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'path',
    function getPath() {
        return this._path;
    }
);

/**
 * The parsed body object.
 *
 * If this returns null, the body could not be parsed. Check the raw body in
 * this case.
 *
 * @member {Object|null} body
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'body',
    function getBody() {
        return this._body;
    }
);

/**
 * The raw body. I.e. this is an unparsed plain raw string.
 *
 * @member {String} rawBody
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'rawBody',
    function getRawBody() {
        return this._rawBody;
    }
);

/**
 * The headers of the request as key-value.
 *
 * The keys are lowercased, the values are plain.
 * Some of the headers are extracted and/or interpreted and stored in their
 * own member variable; e.g. host and port.
 *
 * @member {Object} headers
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'headers',
    function getHeaders() {
        return this._headers;
    }
);

/**
 * The host the request was sent to, e.g. 'localhost' or
 * 'www.example.org' or '123.435.234.32'.
 *
 * @member {String}
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'host',
    function getHost() {
        return this._host;
    }
);

/**
 * The port the request was sent to. Defaults to 80.
 *
 * @member {Number}
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'port',
    function getPort() {
        return this._port;
    }
);

/**
 * The request method (GET, POST ...)
 *
 * @member {String}
 * @readonly
 */
nepp.createGS(module.exports.prototype, 'method',
    function getMethod() {
        return this._method;
    }
);

// }}}

nepp(module.exports.prototype);

/**
 * Base class for controllers using swig.
 *
 * @author Philipp Kemmeter
 */
var VC   = require('valuechecker'),
    Base = require('./Base.js'),
    util = require('util'),
    nepp = require('nepp');

/**
 * Creates a new Swig object.
 *
 * @param {String|RegExp} filename Filename to register to.
 * @constructor
 */
module.exports = function(filename) {
    Base.call(this, filename);
};
util.inherits(module.exports, Base);

module.exports._swig = require('swig');

/**
 * Call this before you create any swig controller objects.
 *
 * This is a wrapper to swig.init and as optional as calling that method is.
 *
 * Example:
 *
 * Swig.init({
 *  allowErrors: false,
 *  autoescape: true,
 *  cache: true,
 *  encoding: 'utf8',
 *  filters: {},
 *  root: /,
 *  tags: {},
 *  extensions: {},
 *  tzOffset: 0
 * });
 *
 * @param {Object} options
 * @see http://paularmstrong.github.io/swig/docs/#api
 */
module.exports.init = function(options) {
    module.exports._swig.init(options);
};


/**
 * Compiles the given template file to a template object.
 *
 * @param {String} tplFilename Filename
 * @return {Object} Swig template object.
 */
module.exports.prototype.compileFile = function(tplFilename) {
    return module.exports._swig.compileFile(
        VC.string(tplFilename, 'tplFilename')
    );
};

/**
 * Renders the given template object with the provided data object.
 *
 * @param {Object} tmpl Swig template object.
 * @param {Object} o    Var object for template assigning.
 * @return {String}
 */
module.exports.prototype.render = function(tmpl, o) {
    return tmpl.render(o);
};

/**
 * Compiles the given template file and renders it directly using the provided
 * data object.
 *
 * @param {String} tplFilename Filename.
 * @param {Object} o            Data object.
 * @return {String}
 */
module.exports.prototype.compileFileAndRender = function(tplFilename, o) {
    return module.exports._swig.compileFile(
        VC.string(tplFilename, 'tplFilename')
    ).render(o);
};

nepp(module.exports);

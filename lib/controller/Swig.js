/**
 * Base class for controllers using swig.
 *
 * @author Philipp Kemmeter
 */
var VC   = require('valuechecker'),
    Base = require('./Base.js'),
    util = require('util'),
    swig = require('swig');

swig.init({
    allowErrors: false,
    autoescape:  false,
    cache:       true,
    encoding:    'utf8',
    filters:     {},
    root:        'htgen/tpl',
    tags:        {},
    extensions:  {},
    tzOffset:    0
});

/**
 * Creates a new Swig object.
 *
 * @param {String|RegExp} filename Filename to register to.
 * @param {Object}        options  The base controller do not accept any
 *                                 options, but inherited objects may do.
 * @constructor
 */
module.exports = function(filename, resp_manager) {
    Base.call(this, filename, resp_manager);
};
util.inherits(module.exports, Base);

/**
 * Compiles the given template file to a template object.
 *
 * @param {String} tpl_filename Filename
 * @return {Object} Swig Template object.
 */
module.exports.prototype.compileFile = function(tpl_filename) {
    return swig.compileFile(VC.string(tpl_filename, 'tpl_filename'));
};

/**
 * Renders the given template object with the provided data object.
 *
 * @param {Object} tmpl Swig Template object.
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
 * @param {String} tpl_filename Filename.
 * @param {Object} o            Data object.
 * @return {String}
 */
module.exports.prototype.compileFileAndRender = function(tpl_filename, o) {
    return swig.compileFile(VC.string(tpl_filename, 'tpl_filename')).render(o);
};

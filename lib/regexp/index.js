/**
 * A list of regular expression objects for standard cases.
 *
 * @author Philipp Kemmeter
 */
module.exports = {
    all:               /.*/,
    files:             /[^\/]$/,
    directories:       /\/$/,
    hidden:            /\/\./,
    hiddenFiles:       /\/\.($|.*[^\/]$)/,
    hiddenDirectories: /\/\..*\/$/
};

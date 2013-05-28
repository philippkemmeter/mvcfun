/**
 * Tests the controller.DirListingForbidden object.
 *
 * @author Philipp Kemmeter
 */
var mvcfun = require('../../../'),
    should = require('should');

describe('regexp', function() {
    var nonHiddenDirTests = [
        '/this/is/a/dir/path/',
        '/',
        '/lala/'
    ];
    var hiddenDirTests = [
        '/this/is/a/hidden/dir/.path/',
        '/this/.is/another/hidden/one/',
        '/./'
    ];
    var nonHiddenFileTests = [
        '/this/is/a/filepath',
        '/this/is/a/filepath.suffix',
        '/lala',
        '/lala.type'
    ];
    var hiddenFileTests = [
        '/this/is/a/hidden/.file',
        '/this/is/a/.hidden/file',
        '/this/is/a/hidden/.file.suffix',
        '/this/is/a/.hidden/file.suffix',
        '/.',
        '/.hidden'
    ];
    describe('.all', function() {
        var all = mvcfun.regexp.all;
        for (var i = 0; i < nonHiddenDirTests.length; ++i) {
            var t = nonHiddenDirTests[i];
            it('should match non-hidden directories ['+t+']', (function(_t) {
                return function() {
                    should.exist(all.exec(_t));
                }
            })(t));
        }
        for (var i = 0; i < hiddenDirTests.length; ++i) {
            var t = hiddenDirTests[i];
            it('should match hidden directories ['+t+']', (function(_t) {
                return function() {
                    should.exist(all.exec(_t));
                }
            })(t));
        }
        for (var i = 0; i < nonHiddenFileTests.length; ++i) {
            var t = nonHiddenFileTests[i];
            it('should match non-hidden files ['+t+']', (function(_t) {
                return function() {
                    should.exist(all.exec(_t));
                }
            })(t));
        }
        for (var i = 0; i < hiddenFileTests.length; ++i) {
            var t = hiddenFileTests[i];
            it('should match hidden files ['+t+']', (function(_t) {
                return function() {
                    should.exist(all.exec(_t));
                }
            })(t));
        }
    });
    describe('.directories', function() {
        var directories = mvcfun.regexp.directories;
        for (var i = 0; i < nonHiddenDirTests.length; ++i) {
            var t = nonHiddenDirTests[i];
            it('should match non-hidden directories ['+t+']', (function(_t) {
                return function() {
                    should.exist(directories.exec(_t));
                }
            })(t));
        }
        for (var i = 0; i < hiddenDirTests.length; ++i) {
            var t = hiddenDirTests[i];
            it('should match hidden directories ['+t+']', (function(_t) {
                return function() {
                    should.exist(directories.exec(_t));
                }
            })(t));
        }
        for (var i = 0; i < nonHiddenFileTests.length; ++i) {
            var t = nonHiddenFileTests[i];
            it('should NOT match non-hidden files ['+t+']', (function(_t) {
                return function() {
                    should.not.exist(directories.exec(_t));
                }
            })(t));
        }
        for (var i = 0; i < hiddenFileTests.length; ++i) {
            var t = hiddenFileTests[i];
            it('should NOT match hidden files ['+t+']', (function(_t) {
                return function() {
                    should.not.exist(directories.exec(_t));
                }
            })(t));
        }
    });
    describe('.files', function() {
        var files = mvcfun.regexp.files;
        for (var i = 0; i < nonHiddenDirTests.length; ++i) {
            var t = nonHiddenDirTests[i];
            it('should NOT match non-hidden directories ['+t+']', (function(_t){
                return function() {
                    should.not.exist(files.exec(_t));
                }
            })(t));
        }
        for (var i = 0; i < hiddenDirTests.length; ++i) {
            var t = hiddenDirTests[i];
            it('should NOT match hidden directories ['+t+']', (function(_t) {
                return function() {
                    should.not.exist(files.exec(_t));
                }
            })(t));
        }
        for (var i = 0; i < nonHiddenFileTests.length; ++i) {
            var t = nonHiddenFileTests[i];
            it('should match non-hidden files ['+t+']', (function(_t) {
                return function() {
                    should.exist(files.exec(_t));
                }
            })(t));
        }
        for (var i = 0; i < hiddenFileTests.length; ++i) {
            var t = hiddenFileTests[i];
            it('should match hidden files ['+t+']', (function(_t) {
                return function() {
                    should.exist(files.exec(_t));
                }
            })(t));
        }
    });
    describe('.hidden', function() {
        var hidden = mvcfun.regexp.hidden;
        for (var i = 0; i < nonHiddenDirTests.length; ++i) {
            var t = nonHiddenDirTests[i];
            it('should NOT match non-hidden directories ['+t+']', (function(_t){
                return function() {
                    should.not.exist(hidden.exec(_t));
                }
            })(t));
        }
        for (var i = 0; i < hiddenDirTests.length; ++i) {
            var t = hiddenDirTests[i];
            it('should match hidden directories ['+t+']', (function(_t) {
                return function() {
                    should.exist(hidden.exec(_t));
                }
            })(t));
        }
        for (var i = 0; i < nonHiddenFileTests.length; ++i) {
            var t = nonHiddenFileTests[i];
            it('should NOT match non-hidden files ['+t+']', (function(_t) {
                return function() {
                    should.not.exist(hidden.exec(_t));
                }
            })(t));
        }
        for (var i = 0; i < hiddenFileTests.length; ++i) {
            var t = hiddenFileTests[i];
            it('should match hidden files ['+t+']', (function(_t) {
                return function() {
                    should.exist(hidden.exec(_t));
                }
            })(t));
        }
    });
    describe('.hiddenFiles', function() {
        var hidden = mvcfun.regexp.hiddenFiles;
        for (var i = 0; i < nonHiddenDirTests.length; ++i) {
            var t = nonHiddenDirTests[i];
            it('should NOT match non-hidden directories ['+t+']', (function(_t){
                return function() {
                    should.not.exist(hidden.exec(_t));
                }
            })(t));
        }
        for (var i = 0; i < hiddenDirTests.length; ++i) {
            var t = hiddenDirTests[i];
            it('should NOT match hidden directories ['+t+']', (function(_t) {
                return function() {
                    should.not.exist(hidden.exec(_t));
                }
            })(t));
        }
        for (var i = 0; i < nonHiddenFileTests.length; ++i) {
            var t = nonHiddenFileTests[i];
            it('should NOT match non-hidden files ['+t+']', (function(_t) {
                return function() {
                    should.not.exist(hidden.exec(_t));
                }
            })(t));
        }
        for (var i = 0; i < hiddenFileTests.length; ++i) {
            var t = hiddenFileTests[i];
            it('should match hidden files ['+t+']', (function(_t) {
                return function() {
                    should.exist(hidden.exec(_t));
                }
            })(t));
        }
    });
    describe('.hiddenDirectories', function() {
        var hidden = mvcfun.regexp.hiddenDirectories;
        for (var i = 0; i < nonHiddenDirTests.length; ++i) {
            var t = nonHiddenDirTests[i];
            it('should NOT match non-hidden directories ['+t+']', (function(_t){
                return function() {
                    should.not.exist(hidden.exec(_t));
                }
            })(t));
        }
        for (var i = 0; i < hiddenDirTests.length; ++i) {
            var t = hiddenDirTests[i];
            it('should match hidden directories ['+t+']', (function(_t) {
                return function() {
                    should.exist(hidden.exec(_t));
                }
            })(t));
        }
        for (var i = 0; i < nonHiddenFileTests.length; ++i) {
            var t = nonHiddenFileTests[i];
            it('should NOT match non-hidden files ['+t+']', (function(_t) {
                return function() {
                    should.not.exist(hidden.exec(_t));
                }
            })(t));
        }
        for (var i = 0; i < hiddenFileTests.length; ++i) {
            var t = hiddenFileTests[i];
            it('should NOT match hidden files ['+t+']', (function(_t) {
                return function() {
                    should.not.exist(hidden.exec(_t));
                }
            })(t));
        }
    });
});

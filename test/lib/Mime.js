/**
 * Checks the Mime class.
 *
 * @author Philipp Kemmeter <phil.kemmeter@gmail.com>
 */
var mvcfun = require('../../'),
    should = require('should');

describe('Mime', function() {

    //
    // Tests Mime.content_type
    //
    describe('#content_type', function() {
        var t = [
            ['text/javascript',  'lala.js'],
            ['text/html',        'index.html'],
            ['text/html',        'index.htm'],
            ['text/css',         'test.css'],
            ['text/plain',       'x.txt'],
            ['text/plain',       'asdf'],
            ['text/plain',       '.js'],
            ['image/jpeg',       'pic.jpg'],
            ['image/jpeg',       'pic.jpeg'],
            ['image/gif',        'pic.gif'],
            ['image/png',        'pic.png'],
            ['video/mov',        'la.mov'],
            ['video/mpeg',       'x.mpg'],
            ['video/mpeg',       'x.mpeg'],
            ['video/avi',        'x.avi'],
            ['application/json', 'hundekuchen.json']
        ];

        for (var i = 0; i < t.length; ++i) {
            it(
                'should return correct content type ['+t[i]+']',
                (function(v) {
                    return function() {
                        (new mvcfun.Mime(v[1])).contentType
                            .should.equal(v[0]);
                    };
                })(t[i])
            );
        }

    });

    //
    // Tests Mime.mime
    //
    describe('#mime', function() {
        var t = [
            /* expected_result, file_name */
            ['text',        'lala.js'],
            ['text',        'index.html'],
            ['text',        'index.htm'],
            ['text',        'test.css'],
            ['text',        'x.txt'],
            ['text',        'asdf'],
            ['text',        '.js'],
            ['image',       'pic.jpg'],
            ['image',       'pic.jpeg'],
            ['image',       'pic.gif'],
            ['image',       'pic.png'],
            ['video',       'la.mov'],
            ['video',       'x.mpg'],
            ['video',       'x.mpeg'],
            ['video',       'x.avi'],
            ['application', 'hundekuchen.json']
        ];

        for (var i = 0; i < t.length; ++i) {
            it(
                'should return correct mime type ['+t[i]+']',
                (function(v) {
                    return function() {
                        (new mvcfun.Mime(v[1])).mime
                            .should.equal(v[0]);
                    };
                })(t[i])
            );
        }
    });
});

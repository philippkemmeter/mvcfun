var Mime = require('../../lib/Mime.js');

module.exports.testGetContentType = function(before_exit, assert) {

    var data = [
        /* expected_result, file_name */
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

    var mime = null;

    for (var i = 0; i < data.length; ++i) {
        mime = new Mime(data[i][1]);
        assert.equal(data[i][0], mime.getContentType(), data[i][1]);
    }

};


module.exports.testGetMime = function(before_exit, assert) {

    var data = [
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

    var mime = null;

    for (var i = 0; i < data.length; ++i) {
        mime = new Mime(data[i][1]);
        assert.equal(data[i][0], mime.getMime(), data[i][1]);
    }

};

/**
 * Tests the request.File object.
 *
 * @author Philipp Kemmeter
 */
var ReqFile = require('../../../lib/request/File.js'),
    util = require('util'),
    HTTPStatusCodes = require('../../../lib/HTTPStatusCodes.js'),
    http = require('http'),
    fs = require('fs'),
    RespMan = require('../../../lib/response/Manager.js'),
    LogClient = require('../../../lib/LogClient');

var Log = function() {};
util.inherits(Log, LogClient);
var l = new Log();

var my_reqfile_instance = new ReqFile(
    {}, l, new RespMan(l)
);

/**
 * Tests the run method - File not found.
 *
 * @param Function before_exit Called before exit.
 * @param assert assert        Assertion object.
 */
module.exports.testRunNOT_FOUND = function(before_exit, assert) {
    var Resp = function() {};
    util.inherits(Resp, http.ServerResponse);

    var n = 0;

    Resp.prototype.writeHead = function(status_code, header) {
        n++;
        assert.eql(HTTPStatusCodes.NOT_FOUND, status_code);
    };
    Resp.prototype.end = function(content) {
        n++;
    };

    my_reqfile_instance.run(
        'filename.html',
        'POST', // doesn't matter
        null,
        new Resp()
    );

    before_exit(function() {
        assert.eql(2, n);
    });
};

/**
 * Tests the run method - Text file found.
 *
 * @param Function before_exit Called before exit.
 * @param assert assert        Assertion object.
 */
module.exports.testRunOK = function(before_exit, assert) {
    var Resp = function() {};
    util.inherits(Resp, http.ServerResponse);

    fs.writeFileSync('/tmp/filename.html', 'Hey!');

    var n = 0;

    Resp.prototype.writeHead = function(status_code, header) {
        n++;
        assert.eql(HTTPStatusCodes.OK, status_code);
    };
    Resp.prototype.end = function(content) {
        assert.eql('Hey!', content.toString());
        n++;
    };

    my_reqfile_instance.setHtDocsDir('/tmp');

    my_reqfile_instance.run(
        'filename.html',
        'POST', // doesn't matter
        null,
        new Resp()
    );

    before_exit(function() {
        fs.unlinkSync('/tmp/filename.html');
        assert.eql(2, n);
    });
};

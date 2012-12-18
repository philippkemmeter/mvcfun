/**
 * Tests the request.Result object.
 *
 * @author Philipp Kemmeter
 */
var Result = require('../../../lib/request/Result.js'),
    util = require('util'),
    http = require('http'),
    LogClient = require('../../../lib/LogClient.js');

var Req = function() {};
var Resp = function() {};
var Log = function() {};

util.inherits(Req, http.IncomingMessage);
util.inherits(Resp, http.ServerResponse);
util.inherits(Log, LogClient);

var my_reqfile_instance = new Result(
    new Req(), new Resp(), new Log()
);

/**
 * Tests the contructor, setter and getter (simple tests).
 *
 * @param Function before_exit Called before exit.
 * @param assert assert        Assertion object.
 */
module.exports.testSetterGetter = function(before_exit, assert) {
    var r = new Result();
    assert.eql('', r.getContent());
    assert.eql({}, r.getHeader());
    r.setContent('dljkjklasjklsjk');
    assert.eql('dljkjklasjklsjk', r.getContent());
    r.setHeader({
        'Content-Type': 'text/plain'
    });
    assert.eql({
        'Content-Type': 'text/plain'
    }, r.getHeader());

    r = new Result('Test');
    assert.eql('Test', r.getContent());
    assert.eql({}, r.getHeader());

    r = new Result('Test', {m:'a'});
    assert.eql('Test', r.getContent());
    assert.eql({m:'a'}, r.getHeader());
};

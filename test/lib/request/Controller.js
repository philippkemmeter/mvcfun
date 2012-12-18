/**
 * Tests the request.Controller object.
 *
 * @author Philipp Kemmeter
 */
var ReqController = require('../../../lib/request/Controller.js'),
    util = require('util'),
    http = require('http'),
    LogClient = require('../../../lib/LogClient.js'),
    HTTPStatusCodes = require('../../../lib/HTTPStatusCodes.js'),
    RespMan = require('../../../lib/response/Manager.js'),
    Controller = require('../../../lib/controller/Base.js');


var Log = function() {};
util.inherits(Log, LogClient);
var log_client = new Log();
var resp_man = new RespMan(log_client);

var my_controller_instance = new ReqController(
    {}, log_client, resp_man
);

/**
 * Tests the addController method.
 *
 * @param Function before_exit Called before exit.
 * @param assert assert        Assertion object.
 */
module.exports.testAddController = function(before_exit, assert) {

    var controller = new Controller('filename.html', resp_man);

    my_controller_instance.addController(
        controller
    );

    assert.equal(
        controller,
        my_controller_instance.getController('filename.html')
    );

}

/**
 * Tests the run method for an existing controller.
 *
 * @param Function before_exit Called before exit.
 * @param assert assert        Assertion object.
 */
module.exports.testRunEXISTS = function(before_exit, assert) {
    var n = 0;
    var Resp = function() {};
    util.inherits(Resp, http.ServerResponse);

    Resp.prototype.writeHead = function(status_code, header) {
        n++;
        assert.eql(HTTPStatusCodes.OK, status_code);
    };
    Resp.prototype.end = function(content) {
        assert.eql('POST{"x":"u"}', content.toString());
        n++;
    };

    my_controller_instance.run(
        'filename.html',    // exists, see testAddController
        'POST',
        {x: 'u'},
        new Resp()
    );

    before_exit(function() {
        assert.equal(2, n);
    });

};

/**
 * Tests the run method for an non-existing controller.
 *
 * @param Function before_exit Called before exit.
 * @param assert assert        Assertion object.
 */
module.exports.testRunNOT_FOUND = function(before_exit, assert) {
    var n = 0;
    var Resp = function() {};
    util.inherits(Resp, http.ServerResponse);

    Resp.prototype.writeHead = function(status_code, header) {
        n++;
        assert.eql(HTTPStatusCodes.NOT_FOUND, status_code);
    };
    Resp.prototype.end = function(content) {
        n++;
    };
    my_controller_instance.run(
        'non-existing_filename.html',
        'POST',
        {},
        new Resp()
    );

    before_exit(function() {
        assert.equal(2, n);
    });

}

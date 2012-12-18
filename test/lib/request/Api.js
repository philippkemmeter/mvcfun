/**
 * Tests the request.Api object.
 *
 * @author Philipp Kemmeter
 */
var ReqApi = require('../../../lib/request/Api.js'),
    util = require('util'),
    http = require('http'),
    HTTPStatusCodes = require('../../../lib/HTTPStatusCodes.js'),
    RespMan = require('../../../lib/response/Manager.js'),
    LogClient = require('../../../lib/LogClient.js');


var Req = function() {};
var Resp = function() {};
var Log = function() {};

util.inherits(Req, http.IncomingMessage);
util.inherits(Resp, http.ServerResponse);
util.inherits(Log, LogClient);

var Log = function() {};
util.inherits(Log, LogClient);
var log_client = new Log();
var resp_man = new RespMan(log_client);

var my_api_instance = new ReqApi(
    {id:'my_session_id123'}, log_client, resp_man
);


/**
 * Tests the run method for an existing API call.
 *
 * @param Function before_exit Called before exit.
 * @param assert assert        Assertion object.
 */
module.exports.testRunEXISTS = function(before_exit, assert) {

    my_api_instance.setApi({
        POST: {
            'test': function(data, session, dals, cb) {
                cb(null, data);
            }
        }
    });

    var n = 0;
    var Resp = function() {};
    util.inherits(Resp, http.ServerResponse);

    Resp.prototype.writeHead = function(status_code, header) {
        n++;
        assert.eql(HTTPStatusCodes.OK, status_code);
    };
    Resp.prototype.end = function(content) {
        assert.eql(
            content,
            '{"err":null,"result":{"x":"u"},"sid":"my_session_id123"}'
        );
        n++;
    };

    my_api_instance.run(
        'test',
        'POST',
        {x: 'u'},
        new Resp()
    );

    before_exit(function() {
        assert.equal(2, n);
    });
};

/**
 * Tests the run method for a non-existing API call.
 *
 * @param Function before_exit Called before exit.
 * @param assert assert        Assertion object.
 */
module.exports.testRunNOT_EXISTS = function(before_exit, assert) {
    return;

    my_api_instance.run(
        'test/asds',
        {},
        function(err, result) {
            assert.equal(-1, err[0]);
            assert.isNull(result);
            n++;
        }
    );

    my_api_instance.run(
        'asds',
        {},
        function(err, result) {
            assert.equal(-1, err[0]);
            assert.isNull(result);
            n++;
        }
    );
}

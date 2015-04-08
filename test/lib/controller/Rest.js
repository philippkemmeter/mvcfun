/**
 * Tests the controller.Rest object.
 *
 * @author Philipp Kemmeter
 */
var mvcfun = require('../../../'),
    util   = require('util'),
    http   = require('http'),
    os     = require('os'),
    fs     = require('fs'),
    should = require('should');

require('should-http');

describe('controller.Rest', function() {
    var respMan = new mvcfun.response.Manager();
    var reqMan  = new mvcfun.request.Manager(
        {
            'text/html'        : respMan,
            'text/plain'       : respMan,
            'application/json' : respMan
        },
        function() {
            return respMan;
        },
        new mvcfun.request.Controller()
    );
    var reqCtrl = reqMan.requestController;

    //
    // Tests controller.Forbidden.run
    //
    describe('#run', function() {
        var methods = mvcfun.http.server.METHODS;
        for (var i = 0; i < methods; ++i) {
            it('should return method not allowed [' + methods[i] + ']',
                (function(method) {
                    return function(done) {
                    }
                })(methods[i])
            );
        }
    });

});

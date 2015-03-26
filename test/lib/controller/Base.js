/**
 * Tests the controller.Base object.
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

describe('controller.Base', function() {
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
    reqMan._requestData = new mvcfun.request.Data(
        new http.IncomingMessage(), ''
    );
    //
    // Tests the run method
    //
    describe('#run', function() {
        it('should send no Content-Language header', function(done) {
            var resp = new http.ServerResponse({GET:'GET'});
            resp.end = function(content) {
                this._header.indexOf('Content-Language').should.be.equal(-1);
                done();
            };
            var ctrl = new mvcfun.controller.Base('/langtest');
            reqCtrl.addController(ctrl);
            reqCtrl.run(resp, ctrl);
        });
        it('should send the correct Content-Language header', function(done) {
            var resp = new http.ServerResponse({GET:'GET'});
            resp.end = function(content) {
                this._header.indexOf('Content-Language: en')
                    .should.be.above(-1);
                done();
            };
            var ctrl = new mvcfun.controller.Base('/langtest');
            ctrl.language = 'en';
            reqCtrl.addController(ctrl);
            reqCtrl.run(resp, ctrl);
        });
    })
});


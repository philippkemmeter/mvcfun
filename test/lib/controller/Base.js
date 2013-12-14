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

describe('controller.Base', function() {
    var reqMan  = new mvcfun.request.Manager(
        new mvcfun.response.Manager(),
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
            ctrl.run(resp, '/1');
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
            ctrl.run(resp, '/1');
        });
    })
});


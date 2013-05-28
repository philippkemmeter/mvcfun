/**
 * Tests the request.Manager object.
 *
 * @author Philipp Kemmeter
 */

var mvcfun = require('../../../'),
    util   = require('util'),
    http   = require('http'),
    should = require('should');

describe('request.Manager', function() {
    var respMan = new mvcfun.response.Manager();

    describe('#setQueryAndBody', function() {
        var reqMan = new mvcfun.request.Manager(
            respMan,
            new mvcfun.request.Controller()
        );
        it('should set properly', function() {
            var query = {lala: 'ulu'};
            var body = {cool: 'object'};
            var rawBody = 'cool object';
            reqMan.setQueryAndBody(query, body, rawBody);
            reqMan.query.should.equal(query);
            reqMan.body.should.equal(body);
            reqMan.rawBody.should.equal(rawBody);
        });
        it('should work properly with empty arguments', function() {
            var query = {};
            var body = {};
            var rawBody = '';
            reqMan.setQueryAndBody(query, body, rawBody);
            reqMan.query.should.equal(query);
            reqMan.body.should.equal(body);
            reqMan.rawBody.should.equal(rawBody);
        });
    });

    //
    // Tests request.Manager.run
    //
    describe('#run', function() {
        var methods = mvcfun.http.Server.METHODS;
        for (var i = 0; i < methods.length; ++i) {
            it(
                'should run the controller manager, if controller matches ['
                    +methods[i]+']',
                 (function(method) {
                    return function(done) {
                        var httpresp = new http.ServerResponse({method:method});

                        var filename = '/file.t';
                        var ReqCtrlMock = function() {
                            mvcfun.request.Controller.call(this);
                        };
                        util.inherits(ReqCtrlMock, mvcfun.request.Controller);
                        ReqCtrlMock.prototype.run = function(f, m, resp) {
                            f.should.equal(filename);
                            m.should.equal(method);
                            resp.should.equal(httpresp);
                            done();
                        };
                        var reqCtrl = new ReqCtrlMock();
                        reqCtrl.addController(
                            new mvcfun.controller.Base(filename)
                        );

                        var reqMan  = new mvcfun.request.Manager(
                            respMan, reqCtrl
                        );
                        reqMan.run(filename, method, httpresp);
                    };
                })(methods[i])
            );
            it(
                'should not run the controller manager, if no controller '
                    +'matches, but write 404 ['+methods[i]+']',
                (function(method) {
                    return function(done) {
                        var httpresp = new http.ServerResponse({method:method});
                        var ReqCtrlMock = function() {
                            mvcfun.request.Controller.call(this);
                        };
                        util.inherits(ReqCtrlMock, mvcfun.request.Controller);
                        ReqCtrlMock.prototype.run = function(f, m, resp) {
                            done('Must not be called!');
                        };
                        var reqCtrl = new ReqCtrlMock();
                        reqCtrl.addController(
                            new mvcfun.controller.Base('/file.t')
                        );

                        httpresp.end = function(content) {
                            this.should.have.status(404);
                            done();
                        };

                        var reqMan = new mvcfun.request.Manager(
                            respMan, reqCtrl
                        );
                        reqMan.run('not_registerd_file', method, httpresp);
                    };
                })(methods[i])
            );
        }
    });
});

/**
 * Tests the controller.Forbidden object.
 *
 * @author Philipp Kemmeter
 */
var mvcfun = require('../../../'),
    util   = require('util'),
    http   = require('http'),
    os     = require('os'),
    fs     = require('fs'),
    should = require('should');

describe('controller.Forbidden', function() {
    var reqMan  = new mvcfun.request.Manager(
        new mvcfun.response.Manager(),
        new mvcfun.request.Controller()
    );
    var reqCtrl = reqMan.requestController;

    //
    // Tests controller.Forbidden.run
    //
    describe('#run', function() {
        var methods = mvcfun.http.Server.METHODS;

        for (var i = 0; i < methods.length; ++i) {
            it(
                'should return 403 if alwaysForbidden is set ['+methods[i]+']',
                (function(method) {
                    return function(done) {
                        var httpresp = new http.ServerResponse({method:method});
                        httpresp.end = function(content) {
                            this.should.have.status(403);
                            done();
                        }

                        var ctrl = new mvcfun.controller.Forbidden(
                            '/filename', {alwaysForbidden: true}
                        );
                        reqCtrl.addController(ctrl);

                        ctrl.run(method, httpresp, '/filename');
                    }
                })(methods[i])
            );
        }
        for (var i = 0; i < methods.length; ++i) {
            it(
                'should return 404 if NOT alwaysForbidden and file not found ['
                +methods[i]+']',
                (function(method) {
                    return function(done) {
                        var httpresp = new http.ServerResponse({method:method});
                        httpresp.end = function(content) {
                            this.should.have.status(404);
                            done();
                        }

                        var ctrl = new mvcfun.controller.Forbidden(
                            '/filename',
                            {alwaysForbidden: false, htdocsDir: os.tmpdir()}
                        );
                        reqCtrl.addController(ctrl);

                        ctrl.run(method, httpresp, '/filename');
                    }
                })(methods[i])
            );
        }
        var tmpfile = os.tmpdir() + '/filename';
        after(function() { fs.unlinkSync(tmpfile) });
        for (var i = 0; i < methods.length; ++i) {
            it(
                'should return 403 if NOT alwaysForbidden and file exists ['
                +methods[i]+']',
                (function(method) {
                    return function(done) {
                        fs.writeFile(tmpfile, 'lala', function(err) {
                            if (err) done(err);
                            var httpresp = new http.ServerResponse(
                                {method: method}
                            );
                            httpresp.end = function(content) {
                                this.should.have.status(403);
                                done();
                            }

                            var ctrl = new mvcfun.controller.Forbidden(
                                '/filename',
                                {alwaysForbidden: false, htdocsDir: os.tmpdir()}
                            );
                            reqCtrl.addController(ctrl);

                            ctrl.run(method, httpresp, '/filename');
                        });
                    }
                })(methods[i])
            );
        }
    });
});

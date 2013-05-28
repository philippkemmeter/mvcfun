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

describe('controller.Static', function() {
    var reqMan  = new mvcfun.request.Manager(
        new mvcfun.response.Manager(),
        new mvcfun.request.Controller()
    );
    var reqCtrl = reqMan.requestController;

    //
    // Tests controller.Static.run
    //
    describe('#run', function() {
        var methods = mvcfun.http.Server.METHODS;
        var tmpfile = os.tmpdir() + '/1';

        afterEach(function() { fs.unlinkSync(tmpfile); });

        for (var i = 0; i < methods.length; ++i) {
            it(
                'should return content of file and status 200 ['+methods[i]+']',
                (function(method) {
                    return function(done) {
                        fs.writeFile(tmpfile, 'lala', function(err) {
                            if (err) done(err);
                            var resp = new http.ServerResponse({method:method});
                            resp.end = function(content) {
                                String(content).should.equal('lala');
                                this.should.have.status(200);
                                done();
                            }

                            var ctrl = new mvcfun.controller.Static(
                                mvcfun.regexp.files,
                                {htdocsDir: os.tmpdir()}
                            );
                            reqCtrl.addController(ctrl);
                            ctrl.run(method, resp, '/1');
                        });
                    }
                })(methods[i])
            );
        }
    });
});

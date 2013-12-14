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

    //
    // Tests request.Manager.run
    //
    describe('#run', function() {
        it('should run the controller manager, if controller matches',
            function(done) {
                var httpresp = new http.ServerResponse({'GET':'GET'});

                var filename = '/file.t';
                var ReqCtrlMock = function() {
                    mvcfun.request.Controller.call(this);
                };
                util.inherits(ReqCtrlMock, mvcfun.request.Controller);
                ReqCtrlMock.prototype.run = function(resp, f) {
                    f.should.equal(filename);
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
                reqMan.run(httpresp, filename);
            }
        );
        it('should not run the controller manager, if no controller '
                +'matches, but write 404',
            function(done) {
                var httpresp = new http.ServerResponse({'GET':'GET'});
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
                reqMan.run(httpresp, 'not_registerd_file');
            }
        );
    });
});

/**
 * Tests the controller.Redirect object.
 *
 * @author Philipp Kemmeter
 */
var mvcfun = require('../../../'),
    util   = require('util'),
    http   = require('http'),
    should = require('should');

require('should-http');

describe('controller.Redirect', function() {
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
    // Tests controller.Redirect.run
    //
    describe('#run', function() {
        var statuses = [300, 301, 302, 303, 304, 305, 306, 307, 308];
        for (var i = 0; i < statuses.length; ++i) {
            it('should redirect to given destination uri [' + statuses[i] + ']',
            (function(status) {
                return function(done) {
                    var httpresp = new http.ServerResponse({GET: 'GET'});
                    httpresp.end = function(content) {
                        this.should.have.status(status);
                        this._header.indexOf('HTTP/1.1 ' + status)
                            .should.equal(0);
                        this._header.indexOf('Location: www.example.org')
                            .should.be.above(0);
                        done();
                    };

                    reqMan._requestData = {path: '/filename'};
                    var ctrl = new mvcfun.controller.Redirect(
                        '/filename', 'www.example.org', {status: status}
                    );
                    reqCtrl.addController(ctrl);
                    reqCtrl.run(httpresp, ctrl);
                }
            })(statuses[i]));
        }

        it('should respect addPath and status default', function(done) {
            var httpresp = new http.ServerResponse({GET: 'GET'});
            httpresp.end = function(content) {
                this.should.have.status(301);
                this._header.indexOf('HTTP/1.1 301')
                    .should.equal(0);
                this._header.indexOf('Location: www.example.org/filename')
                    .should.be.above(0);
                done();
            };

            reqMan._requestData = {path: '/filename'};
            var ctrl = new mvcfun.controller.Redirect(
                '/filename', 'www.example.org', {addPath: true}
            );
            reqCtrl.addController(ctrl);
            reqCtrl.run(httpresp, ctrl);
        });
    });
});

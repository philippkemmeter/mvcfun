/**
 * Tests the controller.Redirect object.
 *
 * @author Philipp Kemmeter
 */
var mvcfun = require('../../../'),
    util   = require('util'),
    http   = require('http'),
    should = require('should');

describe('controller.Redirect', function() {
    var reqMan  = new mvcfun.request.Manager(
        new mvcfun.response.Manager(),
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
                        done();
                    };

                    var ctrl = new mvcfun.controller.Redirect(
                        '/filename', 'www.example.org', {status: status}
                    );
                    reqCtrl.addController(ctrl);
                    reqCtrl.run(httpresp, ctrl);
                }
            })(statuses[i]));
        }
    });
});

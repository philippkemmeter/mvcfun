/**
 * Tests the request.Controller object.
 *
 * @author Philipp Kemmeter
 */

var mvcfun = require('../../../'),
    util   = require('util'),
    http   = require('http'),
    should = require('should');

describe('request.Controller', function() {
    var reqMan  = new mvcfun.request.Manager(
        new mvcfun.response.Manager(),
        new mvcfun.request.Controller()
    );
    var reqCtrl = reqMan.requestController;

    //
    // Tests request.Controller.addController
    //
    describe('#addController', function() {
        it(
            'should add a controller for a string filename',
            function() {
                var ctrl = new mvcfun.controller.Base('/filename.html');
                reqCtrl.addController(ctrl);
                reqCtrl.getController('/filename.html')
                    .should.equal(ctrl);
            }
        );
        it(
            'should add a controller for a regexp filename',
            function() {
                var ctrl = new mvcfun.controller.Base(/huhu/i);
                reqCtrl.addController(ctrl);
                reqCtrl.getController('/huhu.html')
                    .should.equal(ctrl);
                reqCtrl.getController('huHu.o')
                    .should.equal(ctrl);
                reqCtrl.getController('/jh/HUHU')
                    .should.equal(ctrl);
            }
       );

    });

    //
    // Tests request.Controller.removeController
    //
    describe('#removeController', function() {
        it(
            'should remove a controller by string filename',
            function() {
                var ctrl = new mvcfun.controller.Base('/file.html');
                reqCtrl.addController(ctrl);
                reqCtrl.removeController('/file.html').should.be.true;
                should.not.exist(reqCtrl.getController('file.html'));
            }
        );
        it(
            'should remove a controller by regexp filename',
            function() {
                var ctrl = new mvcfun.controller.Base(/a/);
                reqCtrl.addController(ctrl);
                reqCtrl.removeController(/a/).should.be.true;
                should.not.exist(reqCtrl.getController('/a.html'));
            }
        );
        it(
            'should remove a string controller by instance',
            function() {
                var ctrl = new mvcfun.controller.Base('/whatever');
                reqCtrl.addController(ctrl);
                reqCtrl.removeController(ctrl).should.be.true;
                should.not.exist(reqCtrl.getController('/whatever'));
            }
        );
        it(
            'should remove a regex controller by instance',
            function() {
                var ctrl = new mvcfun.controller.Base(/assd/);
                reqCtrl.addController(ctrl);
                reqCtrl.removeController(ctrl).should.be.true;
                should.not.exist(reqCtrl.getController('/assd/'));
            }
        );
        it(
            'should return false if controller to remove could not be found',
            function() {
                var ctrl = new mvcfun.controller.Base('/xzy');
                reqCtrl.removeController(ctrl).should.be.false;
                ctrl = new mvcfun.controller.Base(/xzy/);
                reqCtrl.removeController(ctrl).should.be.false;

                reqCtrl.removeController('lalala').should.be.false;
                reqCtrl.removeController(/lkas/).should.be.false;
            }
        );
    });

    //
    // Tests request.Controller.run
    //
    describe('#run', function() {
        it('should run an existing controller properly', function(done) {
            var myCtrl = new mvcfun.controller.Base('/x.file');
            myCtrl.run = function(resp, path) {
                resp.writeHead(
                    mvcfun.http.StatusCodes.OK,
                    {'Content-Type': 'text/plain'}
                );
                resp.end('Hallo Welt');
            };

            var resp = new http.ServerResponse({GET: 'GET'});

            resp.end = function(content) {
                content.should.equal('Hallo Welt');
                this.should.have.status(mvcfun.http.StatusCodes.OK);
                done();
            };

            reqCtrl.addController(myCtrl);
            reqCtrl.run(resp, '/x.file');
        });
        it('should output 404 if controller does not exist on run',
            function(done) {
                var resp = new http.ServerResponse({'GET': 'GET'});

                resp.end = function(content) {
                    this.should.have.status(
                        mvcfun.http.StatusCodes.NOT_FOUND
                    );
                    done();
                };

                reqCtrl.run(resp, '/y.file');
            }
        );
        it('should call the last added controller on regexp overlap',
            function(done) {
                var ctrl1 = new mvcfun.controller.Base(/a/);
                ctrl1.run = function(resp, path) {
                    done('Must not be called!');
                };
                var ctrl2 = new mvcfun.controller.Base(/ab/);
                ctrl2.run = function(resp, path) {
                    done();
                };
                var resp = new http.ServerResponse({'GET': 'GET'});
                reqCtrl.addController(ctrl1);
                reqCtrl.addController(ctrl2);
                reqCtrl.run(resp, '/ababaa');
            }
        );
        it('should emit error if controller throws', function(done) {
            var myCtrl = new mvcfun.controller.Base('/z.file');
            myCtrl.run = function(resp, path) {
                throw new Error('This should be emitted');
            };
            var Resp = function(){};
            util.inherits(Resp, http.ServerResponse);

            var reqCtrl = new mvcfun.request.Controller();
            reqCtrl._requestManager = reqMan;

            reqCtrl.on('error', function(err) {
                String(err).should.equal(
                    'Error: This should be emitted'
                );
                done();
            });
            reqCtrl.addController(myCtrl);
            reqCtrl.run(new Resp(), '/z.file');
            reqCtrl.removeController('/z.file').should.be.true;
        });
    });
});

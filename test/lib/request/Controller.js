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
    // Tests request.Controller.addController
    //
    describe('#addController', function() {
        var cases = [
            [   // 0
                ['/filename.html', undefined, undefined],
                ['www.example.org', 80, '/filename.html'],
                true
            ],
            [   // 1
                ['/filename.html', undefined, undefined],
                ['anyany', 88930 /*any*/, '/filename.html'],
                true
            ],
            [
                ['/filename.html', undefined, undefined],
                ['anyany', 80, '/wrong.html'],
                false
            ],

            [
                ['/filename.html', 'www.example.org', undefined],
                ['www.example.org', 80, '/filename.html'],
                true
            ],
            [
                ['/filename.html', 'www.example.org', undefined],
                ['www.example.org', 8028 /*any*/, '/filename.html'],
                true
            ],
            [   // 5
                ['/filename.html', 'www.example.org', undefined],
                ['wrong.org', 80, '/filename.html'],
                false
            ],
            [
                ['/filename.html', 'www.example.org', undefined],
                ['www.example.org', 80, '/wrong.html'],
                false
            ],

            [
                ['/filename.html', 'www.example.org', 8080],
                ['www.example.org', 8080, '/filename.html'],
                true
            ],
            [
                ['/filename.html', 'www.example.org', 8080],
                ['wrong.org', 8080, '/filename.html'],
                false
            ],
            [
                ['/filename.html', 'www.example.org', 8080],
                ['www.example.org', 80 /*wrong*/, '/filename.html'],
                false
            ],
            [   // 10
                ['/filename.html', 'www.example.org', 8080],
                ['www.example.org', 8080, '/wrong.html'],
                false
            ],

            [
                [/name\.html$/i, undefined, undefined],
                ['www.example.org', 80, '/filenAmE.html'],
                true
            ],
            [
                [/name\.html$/i, undefined, undefined],
                ['anyany', 88930 /*any*/, '/filename.html'],
                true
            ],
            [
                [/name\.html$/i, undefined, undefined],
                ['anyany', 80, '/wrong.html'],
                false
            ],

            [
                [/name\.html$/i, 'www.example.org', undefined],
                ['www.example.org', 80, '/filename.html'],
                true
            ],
            [   // 15
                [/name\.html$/i, 'www.example.org', undefined],
                ['www.example.org', 8028 /*any*/, '/filename.html'],
                true
            ],
            [
                [/name\.html$/i, 'www.example.org', undefined],
                ['wrong.org', 80, '/filename.html'],
                false
            ],
            [
                [/name\.html$/i, 'www.example.org', undefined],
                ['www.example.org', 80, '/wrong.html'],
                false
            ],

            [
                [/name\.html$/i, 'www.example.org', 8080],
                ['www.example.org', 8080, '/filename.html'],
                true
            ],
            [
                [/name\.html$/i, 'www.example.org', 8080],
                ['wrong.org', 8080, '/filename.html'],
                false
            ],
            [   // 20
                [/name\.html$/i, 'www.example.org', 8080],
                ['www.example.org', 80 /*wrong*/, '/filename.html'],
                false
            ],
            [
                [/name\.html$/i, 'www.example.org', 8080],
                ['www.example.org', 8080, '/wrong.html'],
                false
            ],

            [
                [/name\.html$/i, /\.example\.org$/, 8080],
                ['www.example.org', 8080, '/filename.html'],
                true
            ],
            [
                [/name\.html$/i, /\.example\.org$/, 8080],
                ['lala.example.org', 8080, '/filenAme.html'],
                true
            ],
            [
                [/name\.html$/i, /\.example\.org$/, 8080],
                ['wrong.org', 8080, '/filenAme.html'],
                false
            ],

            [   // 25
                [/name\.html$/i, /\.example\.org$/, /^88*$/],
                ['www.example.org', 8, '/filenAme.html'],
                true
            ],
            [
                [/name\.html$/i, /\.example\.org$/, /^88*$/],
                ['.example.org', 8888, '/filenAme.html'],
                true
            ]
        ];
        for (var i = 0; i < cases.length; ++i) {
            it('should add a single controller controller [Case ' + i + ']',
            (function(ctrlConstrParams, getCtrlParams, result) {
                return function() {
                    reqCtrl.removeAllControllers();

                    var ctrl = new mvcfun.controller.Base(
                        ctrlConstrParams[0],
                        {
                            host: ctrlConstrParams[1],
                            port: ctrlConstrParams[2]
                        }
                    );
                    reqCtrl.addController(ctrl);
                    var ctrlResult = reqCtrl.getController(
                        getCtrlParams[0],
                        getCtrlParams[1],
                        getCtrlParams[2]
                    );

                    if (result)
                        ctrlResult.should.equal(ctrl);
                    else
                        (ctrlResult === null).should.be.true;
                }
            })(cases[i][0], cases[i][1], cases[i][2]));
       }

    });

    //
    // Tests request.Controller.removeController
    //
/*    describe('#removeController', function() {
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
    });*/

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
            reqCtrl.run(resp, myCtrl);
        });
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
            reqCtrl.run(new Resp(), myCtrl);
        });
    });
});

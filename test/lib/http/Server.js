/*
 * Checks the http.Server class.
 *
 * @author Philipp Kemmeter <phil.kemmeter@gmail.com>
 */
var mvcfun = require('../../../'),
    util   = require('util'),
    http   = require('http'),
    should = require('should');

describe('http.Server', function() {
    describe('#Server', function() {
        it('should create running defaults if no params', function() {
            var server = new mvcfun.http.Server();

            server.requestManager.should.exist;
            server.responseManager.should.exist;
            server.responseManagers['text/html'].should.exist;
            server.responseManagers['text/plain'].should.exist;
            server.responseManagers['application/json'].should.exist;

            server.requestManager.requestController.should.exist;
            server.allowedMethods.should.equal(mvcfun.http.Server.METHODS);
            server.reqBodyMaxLength.should.equal(1000);
            server.defaultContentType.should.equal('text/html');
            server.httpServer.should.exist;
        });
        it('should consider the options', function() {
            var MyReqMan = function() {
                this._requestController = {};
                this._responseManager = {};
            };
            util.inherits(MyReqMan, mvcfun.request.Manager);
            var MyRespMan = function() {};
            util.inherits(MyRespMan, mvcfun.response.Manager);

            var myReqMan       = new MyReqMan();
            var myRespManHTML  = new MyRespMan();
            var myRespManPlain = new MyRespMan();
            var myRespManJson  = new MyRespMan();

            var server = new mvcfun.http.Server({
                allowedMethods:      ['GET'],
                reqBodyMaxLength:    99,
                logLevel:            1,
                responseManagers:     {
                    'text/html':        myRespManHTML,
                    'text/plain':       myRespManPlain,
                    'application/json': myRespManJson
                },
                requestManager:     myReqMan,
                defaultContentType: 'application/json'
            });

            server.allowedMethods.should.eql(['GET']);
            server.reqBodyMaxLength.should.equal(99);
            server.logLevel.should.equal(1);
            server.requestManager.should.equal(myReqMan);
            server.responseManager.should.equal(myRespManJson);
            server.responseManagers['application/json'].should.equal(myRespManJson);
            server.responseManagers['text/html'].should.equal(myRespManHTML);
            server.responseManagers['text/plain'].should.equal(myRespManPlain);
            server.defaultContentType.should.equal('application/json');
        });
    });
    describe('#main', function() {
        var allowed = [];
        for (var i = 0; i < mvcfun.http.Server.METHODS.length; ++i) {
            allowed[mvcfun.http.Server.METHODS[i]] = false;
        }
        allowed['GET'] = allowed['POST'] = true;

        for (var m in allowed) {
            it(
                'should respect allowedMethods ['
                    + m + ': ' + allowed[m] + ']',
                (function(method, is_allowed) {
                    return function(done) {
                        var MyRespMan = function() {};
                        util.inherits(MyRespMan, mvcfun.response.Manager);
                        var myRespMan = new MyRespMan();

                        myRespMan.writeMethodNotAllowed
                            = function(_resp, _method)
                        {
                            if (is_allowed)  {
                                done('Allowed method, but 405');
                                return;
                            } else {
                                _resp.should.equal(resp);
                                _method.should.equal(method);
                                done();
                            }
                        };

                        myRespMan.writeInternalServerError
                            = function(_resp, e)
                        {
                            done(e);
                        };

                        var server = new mvcfun.http.Server({
                            allowedMethods:  ['GET', 'POST'],
                            responseManagers: {
                                'text/html': myRespMan
                            }
                        });

                        var req = new http.IncomingMessage();
                        req.method = method;
                        req.on = function(ev) {
                            if (ev != 'end')
                                return;
                            if (!is_allowed)
                                done('Not allowed method, but req man called');
                            else
                                done();
                        };

                        var resp = function() {
                            this.setHeader = function(){};
                        };
                        util.inherits(resp, http.ServerResponse);
                        resp.setHeader = function(){};

                        server.main(req, resp);
                    };
                })(m, allowed[m])
            );
        }
    });
});

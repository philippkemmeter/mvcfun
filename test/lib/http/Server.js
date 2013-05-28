/*
 * Checks the http.Server class.
 *
 * @author Philipp Kemmeter <phil.kemmeter@gmail.com>
 */
var mvcfun = require('../../../'),
    util   = require('util'),
    should = require('should');

describe('http.Server', function() {
    describe('#Server', function() {
        it('should create running defaults if no params', function() {
            var server = new mvcfun.http.Server();

            server.requestManager.should.exist;
            server.responseManager.should.exist;
            server.requestManager.requestController.should.exist;
            server.allowedMethods.should.equal(mvcfun.http.Server.METHODS);
            server.reqBodyMaxLength.should.equal(1000);
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

            var myRespMan = new MyRespMan();
            var myReqMan  = new MyReqMan();

            var server = new mvcfun.http.Server({
                allowedMethods:   ['GET'],
                reqBodyMaxLength: 99,
                logLevel:         1,
                requestManager:   myReqMan,
                responseManager:  myRespMan
            });

            server.allowedMethods.should.eql(['GET']);
            server.reqBodyMaxLength.should.equal(99);
            server.logLevel.should.equal(1);
            server.requestManager.should.equal(myReqMan);
            server.responseManager.should.equal(myRespMan);
        });
    });
});

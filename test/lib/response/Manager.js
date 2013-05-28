/**
 * Tests the response.Manager object.
 *
 * @author Philipp Kemmeter
 */
var mvcfun = require('../../../'),
    util   = require('util'),
    http   = require('http'),
    should = require('should');

describe('response.Manager', function() {
    describe('#constructor', function() {
        it('should have utf-8 as default charset', function() {
            var resp_man = new mvcfun.response.Manager();
            resp_man.charset.should.equal('utf-8');
        });
    });
    //
    // Tests response.Manager.writeHTML
    //
    describe('#writeHTML', function() {
        it(
            'should write html content-type and the given content',
            function(done) {
                var resp_man = new mvcfun.response.Manager();
                resp_man.charset = 'test_charset'
                var test_content = '<html><body>Test</body></html>';

                var ServerResp = function() {};
                util.inherits(ServerResp, http.ServerResponse);
                ServerResp.prototype.end = function(content) {
                    this.should.have.status(mvcfun.http.StatusCodes.OK);
                    this._header.should.match(
                        /content-type: text\/html; charset=test_charset/i
                    );
                    content.should.equal(test_content);
                    done();
                };
                var httpresp = new ServerResp();

                resp_man.writeHTML(httpresp, test_content);
            }
        );
        it(
            'should call writeInternalServerError on error',
            function(done) {
                var resp_man = new mvcfun.response.Manager();
                resp_man.writeInternalServerError = function() {
                    done();
                };

                var ServerResp = function() {};
                util.inherits(ServerResp, http.ServerResponse);
                ServerResp.prototype.end = function(content) {
                    throw new Error('an error');
                };
                var httpresp = new ServerResp();

                resp_man.writeHTML(httpresp, 'las');
            }
        );
    });
    describe('#writeText', function() {
        it(
            'should write text content-type and the given content',
            function(done) {
                var resp_man = new mvcfun.response.Manager();
                resp_man.charset = 'test_charset'
                var test_content = 'Test';

                var ServerResp = function() {};
                util.inherits(ServerResp, http.ServerResponse);
                ServerResp.prototype.end = function(content) {
                    this.should.have.status(mvcfun.http.StatusCodes.OK);
                    this._header.should.match(
                        /content-type: text\/plain; charset=test_charset/i
                    );
                    content.should.equal(test_content);
                    done();
                };
                var httpresp = new ServerResp();

                resp_man.writeText(httpresp, test_content);
            }
        );
        it(
            'should call writeInternalServerError on error',
            function(done) {
                var resp_man = new mvcfun.response.Manager();
                resp_man.writeInternalServerError = function() {
                    done();
                };

                var ServerResp = function() {};
                util.inherits(ServerResp, http.ServerResponse);
                ServerResp.prototype.end = function(content) {
                    throw new Error('an error');
                };
                var httpresp = new ServerResp();

                resp_man.writeText(httpresp, 'las');
            }
        );
    });
    describe('#writeJSON', function() {
        it(
            'should write json content-type and stringified json object',
            function(done) {
                var resp_man = new mvcfun.response.Manager();
                resp_man.charset = 'test_charset'
                var test_json = {my: 'object', rulez: 'da_world'};
                var test_content = '{"my":"object","rulez":"da_world"}';

                var ServerResp = function() {};
                util.inherits(ServerResp, http.ServerResponse);
                ServerResp.prototype.end = function(content) {
                    this.should.have.status(mvcfun.http.StatusCodes.OK);
                    this._header.should.match(
                        /content-type: application\/json; charset=test_charset/i
                    );
                    content.should.equal(test_content);
                    done();
                };
                var httpresp = new ServerResp();

                resp_man.writeJSON(httpresp, test_json);
            }
        );
        it(
            'should call writeInternalServerError on error',
            function(done) {
                var resp_man = new mvcfun.response.Manager();
                resp_man.writeInternalServerError = function() {
                    done();
                };

                var ServerResp = function() {};
                util.inherits(ServerResp, http.ServerResponse);
                ServerResp.prototype.end = function(content) {
                    throw new Error('an error');
                };
                var httpresp = new ServerResp();

                resp_man.writeJSON(httpresp, {h:'u'});
            }
        );
    });
    var createServerResponseForStatusTest = function(status, done) {
        var ServerResp = function() {};
        util.inherits(ServerResp, http.ServerResponse);
        ServerResp.prototype.end = (function(_done) {
            return function(content) {
                this.should.have.status(status);
                _done();
            };
        })(done);
        return new ServerResp();
    };
    describe('#writeInternalServerError', function() {
        it(
            'should write status 500',
            function(done) {
                var ServerResp = function() {};
                util.inherits(ServerResp, http.ServerResponse);
                ServerResp.prototype.end = function(content) {
                    this.should.have.status(
                        mvcfun.http.StatusCodes.INTERNAL_SERVER_ERROR
                    );
                    done();
                };
                var httpresp = new ServerResp();

                var resp_man = new mvcfun.response.Manager();
                resp_man.writeInternalServerError(httpresp, [78, 'error']);
            }
        );
    });
    describe('#writeForbidden', function() {
        it(
            'should write status 403',
            function(done) {
                var httpresp = createServerResponseForStatusTest(403, done);
                var resp_man = new mvcfun.response.Manager();
                resp_man.writeForbidden(httpresp);
            }
        );
    });
    describe('#writeNotFound', function() {
        it(
            'should write status 404',
            function(done) {
                var httpresp = createServerResponseForStatusTest(404, done);
                var resp_man = new mvcfun.response.Manager();
                resp_man.writeNotFound(httpresp);
            }
        );
        it(
            'should name the not found file if given',
            function(done) {
                var ServerResp = function() {};
                util.inherits(ServerResp, http.ServerResponse);
                ServerResp.prototype.end = function(content) {
                    content.should.match(/"test_filename"/);
                    done();
                };
                var httpresp = new ServerResp();

                var resp_man = new mvcfun.response.Manager();
                resp_man.writeNotFound(httpresp, 'test_filename');
            }
        );
    });
    describe('#writeUnauthorized', function(){
        it(
            'should write status 401',
            function(done) {
                var httpresp = createServerResponseForStatusTest(401, done);
                var resp_man = new mvcfun.response.Manager();
                resp_man.writeUnauthorized(httpresp);
            }
        );
    });
    describe('#writeMethodNotAllowed', function(){
        it(
            'should write status 405',
            function(done) {
                var httpresp = createServerResponseForStatusTest(405, done);
                var resp_man = new mvcfun.response.Manager();
                resp_man.writeMethodNotAllowed(httpresp);
            }
        );
        it(
            'should name the disallowed method if given',
            function(done) {
                var ServerResp = function() {};
                util.inherits(ServerResp, http.ServerResponse);
                ServerResp.prototype.end = function(content) {
                    content.should.match(/my_cool_method/);
                    done();
                };
                var httpresp = new ServerResp();

                var resp_man = new mvcfun.response.Manager();
                resp_man.writeMethodNotAllowed(httpresp, 'my_cool_method');
            }
        );
    });
});

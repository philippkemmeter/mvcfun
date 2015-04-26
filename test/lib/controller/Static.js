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

require('should-http');

describe('controller.Static', function() {
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
    // Tests controller.Static.run
    //
    describe('#run', function() {
        var languages = ['', 'en', 'de'];
        var tmpfile = os.tmpdir() + '/1';

        afterEach(function() { fs.unlinkSync(tmpfile); });

        for (var l = 0; l < languages.length; ++l) {
            it(
                'should return content of file and status 200 for GET ['
                    + languages[l] + ']',
                (function(language) {
                    return function(done) {
                        fs.writeFile(tmpfile, 'lala', function(err) {
                            if (err) done(err);
                            var resp = new http.ServerResponse(
                                {GET: 'GET'}
                            );
                            resp.end = function(content) {
                                String(content).should.equal('lala');
                                this.should.have.status(200);

                                if (!language) {
                                    this._header.indexOf('Content-Language')
                                        .should.be.equal(-1);
                                } else {
                                    this._header.indexOf(
                                        'Content-Language: ' + language
                                    ).should.be.above(-1);
                                }
                                done();
                            }

                            var ctrl = new mvcfun.controller.Static(
                                mvcfun.regexp.files,
                                {htdocsDir: os.tmpdir()}
                            );
                            ctrl.language = language;
                            reqCtrl.addController(ctrl);
                            reqMan._requestData = {
                                path: '/1',
                                method: 'GET'
                            }
                            reqCtrl.run(resp, ctrl);
                        });
                    }
                })(languages[l])
            );
        }


        disallowed_methods = [];
        for (var i = 0; i < mvcfun.http.Server.METHODS.length; ++i) {
            if (mvcfun.http.Server.METHODS[i] !== 'GET')
                disallowed_methods.push(mvcfun.http.Server.METHODS[i]);
        }

        for (var i = 0; i < disallowed_methods.length; ++i) {
            for (var l = 0; l < languages.length; ++l) {
                it(
                    'should disallow all methods, but GET ['
                        +disallowed_methods[i] + '; ' + languages[l] + ']',
                    (function(method, language) {
                        return function(done) {
                            fs.writeFile(tmpfile, 'lala', function(err) {
                                if (err) done(err);
                                var resp = new http.ServerResponse(
                                    {method: method}
                                );
                                resp.end = function(content) {
                                    this.should.have.status(405);

                                    if (!language) {
                                        this._header.indexOf('Content-Language')
                                            .should.be.equal(-1);
                                    } else {
                                        this._header.indexOf(
                                            'Content-Language: ' + language
                                        ).should.be.above(-1);
                                    }
                                    done();
                                }

                                var ctrl = new mvcfun.controller.Static(
                                    mvcfun.regexp.files,
                                    {htdocsDir: os.tmpdir()}
                                );
                                ctrl.language = language;
                                reqCtrl.addController(ctrl);
                                reqMan._requestData = {
                                    path: '/1',
                                    method: method
                                };
                                reqCtrl.run(resp, ctrl);
                            });
                        }
                    })(disallowed_methods[i], languages[l])
                );
            }
        }
    });
});

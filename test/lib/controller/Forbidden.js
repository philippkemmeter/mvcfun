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

describe('controller.Forbidden', function() {
    var reqMan  = new mvcfun.request.Manager(
        new mvcfun.response.Manager(),
        new mvcfun.request.Controller()
    );
    var reqCtrl = reqMan.requestController;

    //
    // Tests controller.Forbidden.run
    //
    describe('#run', function() {
        var languages = ['', 'en', 'de'];

        for (var l = 0; l < languages.length; ++l) {
            it(
                'should return 403 if alwaysForbidden is set ['
                    + languages[l] + ']',
                (function(language) {
                    return function(done) {
                        var httpresp = new http.ServerResponse(
                            {GET: 'GET'}
                        );
                        httpresp.end = function(content) {
                            this.should.have.status(403);
                            if (!language) {
                                this._header.indexOf('Content-Language')
                                    .should.be.equal(-1);
                            } else {
                                this._header.indexOf('Content-Language: '
                                    + language).should.be.above(-1);
                            }
                            done();
                        }

                        var ctrl = new mvcfun.controller.Forbidden(
                            '/filename', {alwaysForbidden: true}
                        );
                        reqCtrl.addController(ctrl);
                        ctrl.language = language;

                        reqCtrl.run(httpresp, ctrl);
                    }
                })(languages[l])
            );
        }
        for (var l = 0; l < languages.length; ++l) {
            it(
                'should return 404 if NOT alwaysForbidden and file not '
                + 'found [' + languages[l] + ']',
                (function(language) {
                    return function(done) {
                        var httpresp = new http.ServerResponse({'GET': 'GET'});
                        httpresp.end = function(content) {
                            this.should.have.status(404);
                            if (!language) {
                                this._header.indexOf('Content-Language')
                                    .should.be.equal(-1);
                            } else {
                                this._header.indexOf('Content-Language: '
                                    + language).should.be.above(-1);
                            }
                            done();
                        }

                        reqMan._requestData = {path: '/filename'};
                        var ctrl = new mvcfun.controller.Forbidden(
                            '/filename',
                            {alwaysForbidden: false, htdocsDir: os.tmpdir()}
                        );
                        reqCtrl.addController(ctrl);
                        ctrl.language = language;

                        reqCtrl.run(httpresp, ctrl);
                    }
                })(languages[l])
            );
        }
        var tmpfile = os.tmpdir() + '/filename';
        after(function() { fs.unlinkSync(tmpfile) });
        for (var l = 0; l < languages.length; ++l) {
            it(
                'should return 403 if NOT alwaysForbidden and file exists ['
                    + languages[l] + ']',
                (function(language) {
                    return function(done) {
                        fs.writeFile(tmpfile, 'lala', function(err) {
                            if (err) done(err);
                            var httpresp = new http.ServerResponse(
                                {'GET': 'GET'}
                            );
                            httpresp.end = function(content) {
                                this.should.have.status(403);
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

                            reqMan._requestData = {path: '/filename'}
                            var ctrl = new mvcfun.controller.Forbidden(
                                '/filename',
                                {alwaysForbidden: false, htdocsDir: os.tmpdir()}
                            );
                            reqCtrl.addController(ctrl);
                            ctrl.language = language;
                            reqCtrl.run(httpresp, ctrl);
                        });
                    }
                })(languages[l])
            );
        }
    });
});

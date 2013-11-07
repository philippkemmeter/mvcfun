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

describe('controller.Static', function() {
    var reqMan  = new mvcfun.request.Manager(
        new mvcfun.response.Manager(),
        new mvcfun.request.Controller()
    );
    var reqCtrl = reqMan.requestController;

    //
    // Tests controller.Static.run
    //
    describe('#run', function() {
        var methods = mvcfun.http.Server.METHODS;
        var languages = ['', 'en', 'de'];
        var tmpfile = os.tmpdir() + '/1';

        afterEach(function() { fs.unlinkSync(tmpfile); });

        for (var i = 0; i < methods.length; ++i) {
            for (var l = 0; l < languages.length; ++l) {
                it(
                    'should return content of file and status 200 ['
                        + methods[i] + ', ' + languages[l] + ']',
                    (function(method, language) {
                        return function(done) {
                            fs.writeFile(tmpfile, 'lala', function(err) {
                                if (err) done(err);
                                var resp = new http.ServerResponse(
                                    {method:method}
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
                                ctrl.run(method, resp, '/1');
                            });
                        }
                    })(methods[i], languages[l])
                );
            }
        }
    });
});

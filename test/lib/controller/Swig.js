/**
 * Tests the controller.Swig object.
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

describe('controller.Swig', function() {
    var tpldir = os.tmpdir();

    mvcfun.controller.Swig.init({root: tpldir});
    var tplfile = tpldir + '/tmp.tpl';

    var swigCtrl = new mvcfun.controller.Swig('/anyfile');
    after(function() { fs.unlinkSync(tplfile) });

    fs.writeFileSync(tplfile, '{{ var1 }}<b>{{ var2 }}</b>');

    //
    // Tests controller.Swig.compileFile
    //
    describe('#compileFile', function() {
        it('should generate correct compiled object', function() {
            var o = swigCtrl.compileFile(tplfile);
            o.render({var1: 'hallo', var2: 'welt'}).should.equal(
                'hallo<b>welt</b>'
            );
        });
    });


    //
    // Tests controller.Swig.compileFile
    //
    describe('#render', function() {
        it('should call render of the passed template', function(done) {
            var test_o = {};
            var tmpl = {
                render: function(o) {
                    o.should.equal.test_o;
                    done();
                }
            };

            swigCtrl.render(tmpl, test_o);
        });
    });


    //
    // Tests controller.Swig.compileFileAndRender
    //
    describe('#compileFileAndRender', function() {
        it('should compile the file to correct string', function() {
            swigCtrl.compileFileAndRender(tplfile, {var1: 'a', var2: 'b'})
                .should.equal('a<b>b</b>');
        });
    });
});

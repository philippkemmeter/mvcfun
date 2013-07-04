SHELL     = /bin/sh
REPORTER  = dot
SRCDIR    = lib
COVOBJDIR = lib-cov
TESTDIR   = test

.PHONY: all test cleanall cleancov cleandocs

all: test testcov docs

test:
	mocha --recursive --reporter $(REPORTER)
testcov: testcovhtml testcovjs
testcovhtml: coverage.html
testcovjs: coverage.json

coverage.html coverage.json: $(COVOBJDIR) 
	MVCFUN_COV=1 $(MAKE) test REPORTER=$(subst coverage.,,$@)-cov > $@
$(COVOBJDIR): $(SRCDIR) $(TESTDIR)
	$(MAKE) cleancov && jscoverage $(SRCDIR) $(COVOBJDIR)

docs: $(SRCDIR) docs/readme.html
	doxx --source lib --target docs

docs/readme.html: README.md
	peg-markdown README.md > docs/readme.html

cleanall: cleancov cleandocs

cleancov:
	rm -f coverage.html
	rm -f coverage.json
	rm -rf $(COVOBJDIR)

cleandocs:
	rm -rf docs

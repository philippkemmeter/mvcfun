var libpath = process.env.MVCFUN_COV ? 'lib-cov' : 'lib';

module.exports = require('./' + libpath);

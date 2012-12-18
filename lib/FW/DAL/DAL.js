ValueChecker = require('../ValueChecker');
/**
 * Abstrakte Oberklasse von allen DAL-Objekten
 */
DAL = function(client) {
	this.db = ValueChecker.instance_of(
		client, 'client', require('mysql').Client
	);
};

module.exports = DAL;

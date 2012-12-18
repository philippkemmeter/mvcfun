var ValueChecker = require('../ValueChecker');
var DAL = require('./DAL');
var util = require('util');

/**
 * Layer über der User-Tabelle.
 *
 * @param mysql.Client client Der MySQL-Client
 * @param String user_table   Name der DB-Tabelle mit den Hauptdaten des 
 *                            Nutzers (Name, PW, E-Mail-Adresse ...)
 */
var UserDAL = function(client, user_table) {
	UserDAL.super_.call(this, client);
	this.user_table = ValueChecker.string(user_table, 'user_table');
};

module.exports = UserDAL;
util.inherits(UserDAL, DAL);

/**
 * Gibt alle Daten des Nutzers mit der angegebenen ID als Object zurück.
 *
 * @param uint id     ID des Nutzers.
 * @param Function cb Callback-Funktion (err, results, fields)
 * @return object
 */
UserDAL.prototype.get_data_by_id = function(id, cb) {
	ValueChecker.id(id, 'id');
	this.db.query(
		'SELECT * FROM ' + this.user_table + ' WHERE id = ?',
		[id],
		cb
	);
};

/**
 * Gibt alle Daten des  Nutzers mit  der angegebenen  E-Mail-Adresse als Object
 * zurück.
 *
 * @param string email E-Mail-Adresse.
 * @param Function cb  Callback-Funktion (err, results, fields)
 * @return object
 */
UserDAL.prototype.get_data_by_email = function(email, cb) {
	ValueChecker.email(email, 'email');
	this.db.query(
		'SELECT * FROM ' + this.user_table + ' WHERE email = ?',
		[email],
		cb
	);
};


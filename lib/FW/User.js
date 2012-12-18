var ValueChecker = require('./ValueChecker');
/**
 * Objekt repräsentiert einen Nutzer
 *
 * @param UserDal user_dal Das Datenbank-Layer, das benutzt werden soll.
 */
var User = function(user_dal) {
	this.dal = ValueChecker.instance_of(user_dal, 'user_dal', require('./DAL/UserDAL'));
};

User.ERROR_CODES = {
	'USER_NOT_FOUND': 1,
	'DAL_ERROR': 2,
	'OBJECT_NOT_INITIALIZED': 3
};

module.exports = User;

/**
 * Erzeugt eine Getter-Funktion, wenn noch keine vorhanden sit, für die
 * angegebene Variable.
 *
 * @param String varname Name der Membervariable, die durch get_... von außen
 *                       erreichbar sein soll.
 */
User.prototype._create_getter = function(varname) {
	ValueChecker.string(varname, 'varname');
	if (!this['get_' + varname]) {
		this['get_' + varname] = function() {
			return this[varname];
		}
	}
}

/**
 * Initialisiert den Nutzer anhand der angegebenen ID.
 *
 * @param uint id     Die Id, anhand dessen der Nutzer initialisiert werden
 *                    soll.
 * @param Function cb Die Callback-Funktion (err).
 */
User.prototype.init_by_id = function(id, cb) {
	ValueChecker.instance_of(cb, 'cb', Function);
	var _this = this;
	this.dal.get_data_by_id(
		ValueChecker.id(id), 
		function(err, results) {
			if (err)
				cb([User.ERROR_CODES.DAL_ERROR, err]);
			else if (results.length == 0)
				cb([User.ERROR_CODES.USER_NOT_FOUND, 'User with id ' + id + ' does not exist']);
			else {
				for (var key in results[0]) {
					_this[key] = results[0][key];
					_this._create_getter(key);
				}
				cb(null);
			}
		}
	);
	return this;
};

/**
 * Initialisiert den Nutzer anhand der angegebenen ID.
 *
 * @param String email Die E-Mail-Adresse, anhand dessen der Nutzer 
 *                     initialisiert werden soll.
 * @param Function cb  Die Callback-Funktion (err).
 */
User.prototype.init_by_email = function(email, cb) {
	var _this = this;
	this.dal.get_data_by_email(
		ValueChecker.string(email),
		function(err, results) {
			if (err)
				cb([User.ERROR_CODES.DAL_ERROR, err]);
			else if (results.length == 0)
				cb([User.ERROR_CODES.USER_NOT_FOUND, 'User with email ' + email + ' does not exist']);
			else {
				for (var key in results[0]) {
					_this[key] = results[0][key];
					_this._create_getter(key);
				}
				cb(null);
			}
		}
	);
	return this;
};

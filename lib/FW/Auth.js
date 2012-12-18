var ValueChecker = require('./ValueChecker');
var crypto = require('crypto');
var User = require('./User');

/**
 * Klasse kümmert sich um Nutzerauthentifizierung.
 *
 * @param object session   Session Objekt verwaltet von sesh.
 **/
var Auth = function(session, user_dal) {
	this.session = session;
	this.user_dal = ValueChecker.instance_of(user_dal, 'user_dal', require('./DAL/UserDAL'));
};

module.exports = Auth;

Auth.ERROR_CODES = {
	'LOGIN_FAILED': 1,
	'DAL_ERROR': 2,
	'AUTH_FAILED': 3
};

Auth.kill_session = function(session) {
	session.data = {'user': 'Guest'};
};

/**
 * Loggt den Nutzer mit der angegebenen Email-Passwort-Kombination ein.
 *
 * @param UserDAL user_dal Zugrundeliegendes User-DAL
 * @param String email     Die E-Mail-Adresse des Users
 * @param String password  Das Passwort des Users (plaintext)
 * @param Function cb      Callback-Funktion function(err). In err steht im 
 *                         Fehlerfall drin, was der Fehler war.
 */
Auth.prototype.login = function(email, password, cb) {
	ValueChecker.email(email, 'email');
	ValueChecker.string(password, 'password');
	ValueChecker.instance_of(cb, 'cb', Function);
	var pw = crypto.createHash('sha1').update(password).digest('base64');

	_this = this;
	this.user_dal.get_userdata_by_email(email, function(err, results) {
		if (err)
			cb([Auth.ERROR_CODES.DAL_ERROR, err]);
		else {
			if (results.length < 1 || results[0].email != email || results[0].password != pw) {
				Auth.kill_session(_this.session);
				cb([Auth.ERROR_CODES.LOGIN_FAILED, 'E-Mail-Address and Password do not match.']);
			}
			else {
				_this.session.data.user = results[0].nick;
				_this.session.data.password = results[0].password;
				_this.session.data.email = results[0].email;
				cb(null);
			}
		}

	});
};

/**
 * Gibt zurück, ob die Session einen eingeloggten Zustand beschreibt.
 *
 * @return bool
 */
Auth.prototype.check_auth = function(cb) {
	if (this.session.data.user != 'Guest' && this.session.data.user != '')
		cb();
	else
		cb([Auth.ERROR_CODES.AUTH_FAILED, 'Authorization failed. User not logged in']);
};

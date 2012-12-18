var ValueChecker = require('./FW/ValueChecker');
var FW_Auth = require('./FW/Auth');
var ErrorCodes = require('./ErrorCodes');
var util = require('util');

/**
 * Eigene Nutzerauthentifizierung für die Hochzeit (kein Username, nur PW).
 *
 * @param object session Session-Objekt verwarltet von sesh.
 */
Auth = function(session) {
	this.session = session;
};

module.exports = Auth;

util.inherits(Auth, FW_Auth);

/**
 * Es gibt nur einen Nutzer bei uns, deswegen brauchen wir nur ein valides PW.
 *
 * @param String password  Das Passwort des Users (plaintext)
 * @param Function cb      Callback-Funktion function(err, result:bool).
 */
Auth.prototype.login = function(password, cb) {
	ValueChecker.string(password, 'password');
	ValueChecker.instance_of(cb, 'cb', Function);

	if (password.toLowerCase() == 'hochzeit2012') {
		this.session.data.user = 'hochzeit';
		this.session.data.password = 'hochzeit2012';
		cb(null, true);
	} else {
		cb([ErrorCodes.LOGIN_FAILED, 'Das Passwort ist falsch'], false);
	}
};

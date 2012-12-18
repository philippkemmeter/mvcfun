var FW = require('./FW/'),
    ErrorCodes = require('./ErrorCodes'),
    Auth = require('./Auth');

/**
 * Das ist die Stelle, wo die reinkommenden Befehle an die entsprechenden
 * Module weitergereicht werden.
 *
 * Alle Funktionen erwarten drei Parameter:
 * 1. Parameter-Objekt
 * 2. Sitzungs-Objekt
 * 3. DALs
 * 4. Callback-Function
 *
 * Das Parameter-Objekt enthält die Parameter der Funktion als key-value-Paare.
 * Auf diese Weise können geparste GET-Parameter direkt übergeben werden.
 * In der Doku der entsprechenden Funktion steht, welche keys erwartet werden
 * und welche Werte sie annehmen dürfen.
 *
 * Das Sitzungsobjekt ist die aktuelle Sitzung. Sie kann von der Funktion
 * verändert werden. Wenn das passiert, wird das entsprechend dort vermerkt.
 *
 * Die DALs sind nötig, um auf die DB zugreifen zu können.
 *
 * Die Callback-Funktion wird aufgerufen, wenn die Prozesse abgearbeitet sind,
 * wobei als erster Paramter eine ggf. existente Fehlermeldung übergeben wird.
 * Ist diese NULL, so ist kein Fehler vorhanden und im zweiten Parameter
 * befindet sich der Rückgabewert der Funktion.
 * Der Fehler wird als Array [Fehlercode, Fehlermeldung] übergeben.
 *
 * @author Philipp Kemmeter
 */

exports.GET = {
    /**
     * Session related methods
     */
    session: {
        /**
         * Diese Funktion gibt zurück, ob der Nutzer eingeloggt ist.
         *
         * @param void foo              Not used.
         * @param SessionObject session Sitzung
         * @param Object<DAL> dals      Alle DALs als assoc Array
         * @param Function cb           Callback-Funktion (err, result: bool)
         */
        auth: function(foo, session, dals, cb) {
            var auth = new Auth(session);
            auth.check_auth(function(err) {
                if (err) {
                    if (err[0] == ErrorCodes.AUTH_FAILED) {
                        cb(null, false);
                    } else {
                        cb(err, false);
                    }
                } else {
                    cb(null, true);
                }
            });
        }
    }
};

exports.POST = {
    /**
     * Session related methods
     */
    session: {
        /**
         * Versucht den Nutzer mit dem Passwort einzuloggen.
         * Die übergebene Session wird entsprechend verändert.
         *
         * @param string password       Das Passwort.
         * @param SessionObject session Session
         * @param Object<DAL> dals      Alle DALs als assoc array
         * @param Function cb           Callback-Funktion (err, result: bool)
         */
        auth: function(password, session, dals, cb) {
            try {
                password = FW.ValueChecker.string(
                    password, 'password'
                );
            }
            catch (e) {
                cb([ErrorCodes.ILLEGAL_ARGUMENT, e]);
                return;
            }
            var auth = new Auth(session);
            auth.login(password, cb);
        }
    }
};

exports.DELETE = {
    /**
     * Session related methods
     */
    session: {
        /**
         * Loggt den aktuellen Nutzer aus, indem die aktive Sitzung gekillt wird.
         *
         * @param GET param_obj         Parameter-Object
         *                              {}
         * @param SessionObject session Sitzung
         * @param Object<DAL> dals      Alle DALs als assoc Array
         * @param Function cb           Callback-Funktion (err, result: bool)
         */
        auth: function(param_obj, session, dals, cb) {
            FW.Auth.kill_session(session);
            if (cb)
                cb(null, true);
        }
    }
};


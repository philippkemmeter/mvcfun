/**
 * Konfigurationsmodul.
 *
 * Hier kann man alles wild anpassen.
 *
 * @author Philipp Kemmeter
 */
var ConfigShared = require('./ConfigShared');

exports.SERVER_PORT = 8080;
exports.TMP_DIR = './tmp';
exports.SAVE_DIR = './upload';
exports.HTDOCS_DIR = './htdocs';
exports.DEBUG_LEVEL = 0;
exports.LOG_CLIENT_IP = 'localhost';
exports.LOG_CLIENT_PORT = '8078';

for (var i in ConfigShared) {
    exports[i] = ConfigShared[i];
}

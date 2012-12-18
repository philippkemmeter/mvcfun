/**
 * Konfigurationsmodul.
 *
 * Die hiesigen Configparameter sind auch auf Client-Seite verwendbar. Das
 * bedeutet aber auch, dass sie für Angreifer sichtbar werden. Deswegen sind
 * Serverkonfigurationen wie Pfade oder Ports hier NICHT abzulegen!
 *
 * @author Philipp Kemmeter
 */

exports.UPLOAD_ALLOWED_EXTENSIONS = ['mpg', 'gif', 'jpg', 'jpeg', 'mov', 'avi', 'png'];
exports.UPLOAD_SIZE_LIMIT = 104857600; // 100MB

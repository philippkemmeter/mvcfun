var FW = require('philfw'),
    ErrorCodes = require('./ErrorCodes');

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
};

exports.POST = {
};

exports.DELETE = {
};


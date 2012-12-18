exports.ValueChecker = require('./ValueChecker');
exports.Auth = require('./Auth');
exports.User = require('./User');
exports.UserDAL = require('./DAL/UserDAL');

/**
 * Prüft, ob zwei Objekte gleich sind.
 */
exports.equals = function(obj1, obj2, exact_match) {
	if ((typeof(obj1) != 'object') || (typeof(obj2) != 'object'))
		return false;
	
	var n = 0;
	for (var i in obj1) {
		if (typeof(obj1[i]) != typeof(obj2[i]))
			return false;
		if (typeof(obj1[i]) == 'object') {
			if (!exports.equals(obj1[i], obj2[i], exact_match))
				return false;
		}
		if ((exact_match && (obj1[i] !== obj2[i]))
				|| (!exact_match && (obj1[i] != obj2[i])))
			return false;
		n++;
	}
	var m = 0;
	for (var i in obj2)
		m++;
	if (n != m)
		return false;
	
	return true;
}

/**
 * Trimmt einen String (wie PHP-Trim). Wird chars angegeben, werden diese
 * Buchstaben herausgefiltert am Anfang und Ende des Strings, sonst wie in PHP
 * \0
 * \t
 * \r
 * \n
 * " "
 * \x0B (vertical Tab)
 * 
 * Basiert auf der Idee und Umsetzung von http://www.webtoolkit.info/.
 * 
 * @param String s
 * @param String characters 
 * @see http://www.webtoolkit.info/
 */
exports.trim = function(s, characters) {
	if (s)
		return exports.ltrim(exports.rtrim(s, characters), characters);
	else
		return '';
};

/**
 * Trimmt den String nur von links.
 * @see exports.trim
 * @see http://www.webtoolkit.info/
 */
exports.ltrim = function(s, characters) 
{
	if (s)
		return s.replace(new RegExp("^[" + (characters||"\\s") + "]+", "g"), "");
	else
		return '';
};

/**
 * Trimmt den String nur von links.
 * @see exports.trim
 * @see http://www.webtoolkit.info/
 */
exports.rtrim = function(s, characters)
{
	if(s)
		return s.replace(new RegExp("[" + (characters||"\\s") + "]+$", "g"), "");
	else
		return '';
};

/**
 * Konvertiert ein Objekt in eine Standarddarstellung ohne Methoden.
 *
 * Geht rekursiv durch alle Kinder bis zur maximalen angegebenen 
 * Rekursionstiefe. Wird keine Tiefe angegeben, wird 5 angenommen.
 *
 * Mithilfe von ignore_keys können einzelne Schlüssel ignoriert werden. Das
 * kann ganz nützlich sein, wenn man bestimmte Kindobjekte oder Werte 
 * rausschmeißen will.
 *
 * @param mixed o              Das zu konvertierende Objekt oder Array. Ist o
 *                             eine Funktion wird [Function] zurückgegeben. Ist
 *                             o ein Primitivum, wird das o selbst 
 *                             zurückgegeben.
 * @param uint rec_depth       Die maximale Rekursionstiefen. Default: 5.
 * @param string[] ignore_keys Die zu ignorierenden Schlüssel.
 * @return mixed               Rückgabetyp entspricht dem Typ von o.
 */
exports.convert_to_std_obj = function(o, rec_depth, ignore_keys) {
	if (typeof(rec_depth) == 'undefined')
		rec_depth = 5;
	if (typeof(ignore_keys) == 'undefined')
		ignore_keys = [];

	if (typeof(o) == 'function')
		return '[Function]';
	if (typeof(o) == 'object') {
		var new_o = (typeof(o.length) == 'undefined') ? {} : [];
		for (i in o) {
			if (typeof(o[i]) == 'function')
				continue;
			if (ignore_keys.search(i) != -1)
				continue;

			if (rec_depth == 0) {
				if (typeof(o[i]) == 'object')
					new_o[i] = '[Object]';
				else
					new_o[i] = o[i];
			}
			else
				new_o[i] = exports.convert_to_std_obj(
					o[i], rec_depth-1, ignore_keys
				);
		}
		return new_o;
	}
	else {
		return o;
	}
};


/********************************************************************
 * Erweiterungen der built-in sowie Host-Objekte
 ********************************************************************/

/**
 * Ergänzt das Array-Objekt um die Funktion contains, welche angibt, ob
 * das Array den übergebenen Wert enthält.
 * 
 * @param mixed obj
 * @return boolean
 */
Array.prototype.contains = function(obj, excat_match) {
	if (typeof(exact_match) == 'undefined')
		exact_match = true;
	var listed = false;
	for (var i = 0; i < this.length; i++) {
		if ((exact_match && (this[i] === obj)) 
			|| (!exact_match && this[i] == obj)) 
		{
			listed = true;
			break;
		}
	}
	return listed;
};

/**
 * Ergänzt das Array-Objekt um die Funktion search, welche den Indexschlüssel
 * zurückgibt, unter welchem das angegebene Objekt abgelegt ist. Wird das
 * Element nicht gefunden, wird -1 zurückgegeben.
 * 
 * @param mixed obj
 * @return {-1, 0, 1, ..., n-1}
 */
Array.prototype.search = function(obj, exact_match) {
	if (typeof(exact_match) == 'undefined')
		exact_match = true;

	if (typeof(obj) == 'object') {
		for (var i = 0; i < this.length; i++) {
			if (exports.equals(this[i], obj, exact_match))
				return i;
		}
	}
	else {
		for (var i = 0; i < this.length; i++) {
			if ((exact_match&&(this[i] === obj))
					|| (!exact_match&&(this[i] == obj)))
				return i;
		}
	}

	return -1;
};

/**
 * Entfernt das angegebene Objekt aus dem Array. Wird der letzte Parameter
 * "max_removements" kann optional angegeben werden, um anzugeben, wie viele 
 * Vorkommen des Objekts maximal gelöscht werden dürfen.
 * 
 * @param mixt obj
 * @param uint max_removements
 * @return Array	Gibt sich selbst nach der Operation zurück
 */
Array.prototype.remove = function(obj, max_removements) {
    var i = 0;
    var n = this.length;
    var r = 0;
    while ((i < n) && (!max_removements || ((r < max_removements)))) {
        if (this[i] === obj){
            this.splice(i, 1);
            r++;
            n--;
        } else {
            i++;
        }
    }
    return this;
};

/**
 * Zerstört das Array und ruft destroy für alle Kinder auf.
 */
Array.prototype.destroy = function() {
	for (var i = 0; i < this.length; i++) {
		if (typeof(this[i]) !== 'function') {
			try {
				this[i].destroy();
			}
			catch(e) {
				try {
					delete this[i];
				}
				catch(e) {}
			}
		}
	}
	try {
		delete this;
	}
	catch(e) {}
}

/**
 * Mischt das Array (basiert auf Fisher-Yates-Algorithmus)
 */
Array.prototype.shuffle = function() {
	var i = this.length;
	if ( i == 0 )
		return this;
	while ( --i ) {
		var j = Math.floor( Math.random() * ( i + 1 ) );
		var tempi = this[i];
		var tempj = this[j];
		this[i] = tempj;
		this[j] = tempi;
	}
	return this;
};

/**
 * Gibt ein zufällig gezogenes Element zurück
 * 
 * @return mixed
 */
Array.prototype.random = function() {
	return this[Math.floor(Math.random()*this.length)];
};

/**
 * Array-Push-Methode, wenn noch nicht existent
 */
if (!Array.prototype.push) {
	Array.prototype.push = function(elem) {
		this[this.length] = elem;
	}
};

/**
 * Math-Objekt wird um die sign-Funktion erweitert.
 */
if (!Math.sign) {
	Math.sign = function(n) {
		if (n > 0)
			return 1;
		if (n < 0)
			return -1;
		else
			return 0;
	}
};

/**
 * Rückgabe des Strings als Kopie mit erstem Buchstaben groß.
 * @return
 */
String.prototype.ucfirst = function() {
    return this.charAt(0).toUpperCase() + this.substr(1);
};

/**
 * Diese Klasse ist rein statisch und gruppiert alle Funktionen, die zum prüfen
 * von  Werten  nötig  sind.  Immer,  wenn  der  Test  fehlschlägt,  wird  eine
 * IllegalArgumentError  geworfen  mit  einer  schönen  Fehlermeldung  à la
 * Mengenlehre.
 *
 * @author Philipp Kemmeter
 */


/**
 * Prüft,  ob der  übergebene  Wert  ein String  ist oder  zu einem  String
 * gecastet werden kann.
 *
 * Mithilfe der anderen Parameter kann der String näher eingegrenzt werden.
 * Es wird der übergebene Wert zurückgegeben.
 *
 * @param mixed $value					Der zu prüfende Wert
 * @param string $varname				Name der Variable  (für die Ausgabe
 * 										der Fehlermeldung.
 * @param bool $empty_allowed			Ob Leerstring okay ist.
 * @param int/FALSE $min				Minimale Anzahl  Zeichen. Bei FALSE
 * 										gibt es kein Minumum.
 * @param int/FALSE $max				Maximale  Anzahl Zeichen. Bei FALSE
 * 										gibt es kein Maxmimum.
 * @param string $disallowed_chars		String  mit   Zeichen,   die  nicht
 * 										enthalten sein dürfen.
 * @throws IllegalArgumentError		Wenn der zu testende Wert nicht den
 * 										übergebenen Kriterien entspricht.
 * @return string
 */
exports.string = function(value, varname, empty_allowed, min, max, 
	disallowed_chars)
{
	if (!empty_allowed && (String(value).length == 0)) {
		throw new Error(
			varname + ' must not be empty; "' + value + '" given'
		);
	}
	if (disallowed_chars && disallowed_chars.length 
		&& disallowed_chars.length > 0) 
	{
		for (var i = 0, n = disallowed_chars.length; i < n; i++) {
			if (value.indexOf(disallowed_chars.charAt(i)) !== -1) {
				throw new Error(
					varname + ' must not contain ' + 
						disallowed_chars.charAt(i) + '; "'
						+ value + '" given'
				);
			}
		}
	}

	if ((typeof(min) != 'undefined') && ((value.length) < min)) {
		throw new Error(
			varname + ' must be at least ' + min + ' characters long; ' +
				'"' + value + '" given'
		);
	}
	if ((typeof(max) != 'undefined') && ((value.length) < max)) {
		throw new Error(
			varname + ' must be at most ' + max + ' characters long; ' +
				'"' + value + '" given'
		);
	}

	if ((typeof(min) != 'undefined') && (typeof(max) != 'undefined') 
		&& (min > max)) 
	{
		throw new Error(
			'max has to be greater than min'
		);
	}

	return String(value);
};

/**
 * Prüft, ob der übergebene  Wert ein Float  ist oder  zu einem  Float ohne
 * Wertverlust gecastet werden kann.
 *
 * Somit sind Integer ebenso  erlaubt wie auch Strings, die einen Floatwert
 * repräsentieren.
 *
 * @param mixed $value					Der zu prüfende Wert
 * @param string $varname				Name der Variable  (für die Ausgabe
 * 										der Fehlermeldung.
 * @param int/FALSE $min				Kleinst  erlaubter Wert.  Bei FALSE
 * 										gibt es kein Minimum.
 * @param int/FALSE $max				Größt  erlaubter  Wert.  Bei  FALSE
 * 										gibt es kein Maximum.
 * @throws IllegalArgumentError		Wenn der zu testende Wert nicht den
 * 										übergebenen Kriterien entspricht.
 * @return float
 */
exports.float = function(value, varname, min, max) {
	if (typeof(min) == 'undefined') {
		if (typeof(max) == 'undefined') {
			if (isNaN(value)) {
				throw new Error(
					varname + '=="' + value + '" ∉ ℝ'
				);
			}
		}
		else if (max == 0) {
			if (isNaN(value) || (value > max)) {
				throw new Error(
					varname + '=="' + value + '" ∉ ℝ₀⁻'
				);
			}
		}
		else if (max == 1) {
			if (isNaN(value) || (value > max)) {
				throw new Error(
					varname + '=="' + value + "' ∉ ℝ⁻\{0}"
				);
			}
		}
		else {
			if (isNaN(value) || (value > max)) {
				throw new Error(
					varname + '=="' + value + '" ∉ ]-∞; ' + max + ']'
				);
			}
		}
	}
	else {
		if (typeof(max) == 'undefined') {
			if (min == 0) {
				if (isNaN(value) || (value < min)) {
					throw new Error(
						varname + '=="' + value + '" ∉ ℝ₀⁺'
					);
				}
			}
			else if (min == 1) {
				if (isNaN(value) || (value < min)) {
					throw new Error(
						varname + '=="' + value + '" ∉ ℝ⁺\{0}'
					);
				}
			}
			else {
				if (isNaN(value) || (value < min)) {
					throw new Error(
						varname + '=="' + value + '" ∉ [' + min + '; ∞]'
					);
				}
			}
		}
		else {
			if (min > max) {
				throw new Error(
					'max has to be greater than min'
				);;
			}
			if (isNaN(value) || (value < min) || (value > max)) {
				throw new Error(
					varname + '=="' + value + '" ∉ [' + min + '; ' + max + ']'
				);
			}
		}
	}

	return parseFloat(value);
};

/**
 * Prüft, ob der übergebene Wert eine ID ist.
 *
 * IDs sind Integerwerte die >= 0 sind. Viele sind auch > 0.
 *
 * @param mixed $value					Der zu prüfende Wert
 * @param string $varname				Name der Variable  (für die Ausgabe
 * 										der Fehlermeldung.
 * @param bool $zero_allowed			Ob 0 als Wert erlaubt ist.
 * @throws IllegalArgumentError		Wenn der zu testende Wert nicht den
 * 										übergebenen Kriterien entspricht.
 * @return uint
 */
exports.id = function(value, varname, zero_allowed) {
	if (zero_allowed)
		return exports.int(value, varname, 0);
	else
		return exports.int(value, varname, 1);
};

/**
 * Prüft, ob der angegebene Wert ein gültiger UNIX-Timestamp ist.
 *
 * @param mixed $value					Der zu prüfende Wert
 * @param string $varname				Name der Variable  (für die Ausgabe
 * 										der Fehlermeldung.
 * @throws IllegalArgumentError		Wenn der zu testende Wert nicht den
 * 										übergebenen Kriterien entspricht.
 * @return uint
 */
exports.t_stamp = function(value, varname) {
	return exports.int(value, varname, 0);
};

/**
 * Prüft, ob der angegebene Wert ein Integer ist  oder verlustfrei in einen
 * Integer gecastet werden kann.
 *
 * Dabei  können  durch   die  anderen  Parameter  weitere  Einschränkungen
 * definiert werden.
 *
 * @param mixed $value					Der zu prüfende Wert
 * @param string $varname				Name der Variable  (für die Ausgabe
 * 										der Fehlermeldung
 * @param int/FALSE $min				Kleinst  erlaubter Wert.  Bei FALSE
 * 										gibt es kein Minimum.
 * @param int/FALSE $max				Größt  erlaubter  Wert.  Bei  FALSE
 * 										gibt es kein Maximum.
 * @throws IllegalArgumentError		Wenn der zu testende Wert nicht den
 * 										übergebenen Kriterien entspricht.
 * @return int
 */
exports.int = function(value, varname, min, max) {
	if (typeof(min) == 'undefined') {
		if (typeof(max) == 'undefined') {
			if (value != parseInt(value)) {
				throw new Error(
					varname + '=="' + value + '" ∉ ℤ'
				);
			}
		}
		else if ((value != parseInt(value)) || (value > max)) {
			throw new Error(
				varname + '=="' + value 
					+ '" ∉ {-∞, ..., ' + (max-1) + ',' + max + '}'
			);
		}
	}
	else {
		if (typeof(max) == 'undefined') {
			if (min == 0) {
				if ((value != parseInt(value)) || (value < min)) {
					throw new Error(
						varname + '=="' + value + '" ∉ ℕ₀'
					);
				}
			}
			else if (min == 1) {
				if ((value != parseInt(value)) || (value < min)) {
					throw new Error(
						varname + '=="' + value + '" ∉ ℕ₁'
					);
				}
			}
			else {
				if ((value != parseInt(value)) || (value < min)) {
					throw new Error(
						varname + '=="' + value + '" ∉ [' + min + '; ∞]'
					);
				}
			}
		}
		else {
			if (min > max) {
				throw new Error(
					'max has to be greater than min'
				);;
			}
			if ((value != parseInt(value)) || (value < min) || (value > max)) {
				throw new Error(
					varname + '=="' + value 
						+ '" ∉ {' + min + ', ' + (min+1) + ', ...∞}'
				);
			}
		}
	}

	return parseInt(value);
};

/**
 * Prüft, ob der übergebene Wert in dem Übergebenen Array enthalten ist.
 *
 * @param mixed $value					Der zu prüfende Wert
 * @param string $varname				Name der Variable  (für die Ausgabe
 * 										der Fehlermeldung.
 * @param array $values					Das Array worin <code>$value</code>
 * 										enthalten sein soll.
 * @throws IllegalArgumentError		Wenn der zu testende Wert nicht den
 * 										übergebenen Kriterien entspricht.
 * @return mixed
 */
exports.values = function(value, varname, values) {
	if (values.search(value) == -1) {
		throw new Error(
			varname + '=="' + value + '" ∉ {' + values.join('}, {') + '}' 
		);
	}

	return value;
};

/**
 * Prüft, ob der übergebene Wert ein Bool  ist oder verlustfrei in ein Bool
 * gecastet werden kann.
 *
 * Es werden somit neben TRUE und FALSE auch 1 und 0 akzeptiert.
 *
 * @param mixed $value					Der zu prüfende Wert
 * @param string $varname				Name der Variable  (für die Ausgabe
 * 										der Fehlermeldung.
 * @throws IllegalArgumentError		Wenn der zu testende Wert nicht den
 * 										übergebenen Kriterien entspricht.
 * @return bool
 */
exports.bool = function(value, varname) {
	if ((value !== !!value) && (value !== 1) && (value !== 0))
		throw new Error(
			varname + ' should be boolean, ' + value + 'given'
		);

	return !!value;
};

exports.instance_of = function(value, varname, instance) {
	if (!(value instanceof instance)) {
		throw new Error(
			varname + " has to be an instance of "
			+ instance + '; ' + value.constructor + ' given'
		);
	}
	return value;
};

exports.email = function(value, varname) {
	/*if (!value.test(/^[^@\(\)\:]+@[^@\(\)\:]+\.[a-zA-Z]{2,4}$/)) {
		throw new Error(
			varname + " has to be a valid email address; '"
			+ value + "' given"
		);
	}*/
	return value;
};

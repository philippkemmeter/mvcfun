/**
 * Diese Klasse behandelt das Hochladen von Dateien.
 *
 * @author Philipp Kemmeter
 */
var http = require('http'),
    HTTPStatusCodes = require('./HTTPStatusCodes.js'),
    util = require('util'),
    Formidable = require('formidable'),
    url = require('url'),
    path = require('path'),
    FW = require('./FW/'),
    Config = require('./Config.js'),
    LogClient = require('./LogClient.js'),
    ErrorCodes = require('./ErrorCodes.js');

/**
 * Erzeugt eine neues ÚploadManager-Objekt.
 *
 * @param http.ClientRequest req   Request-Objekt.
 * @param http.ClientResponse resp Response-Objekt.
 * @param LogClient log_client     Client zum Loggen.
 */
var UploadManager = function(req, resp, log_client, upload_dir) {
    this._req = FW.ValueChecker.instance_of(
        req, 'req', http.IncomingMessage
    );
    this._resp = FW.ValueChecker.instance_of(
        resp, 'resp', http.ServerResponse
    );
    this._log_client = FW.ValueChecker.instance_of(
        log_client, 'log_client', LogClient
    );
    this._upload_dir = (typeof(upload_dir) == 'undefined')
        ? Config.SAVE_DIR
        : FW.ValueChecker.string(upload_dir, 'upload_dir');
};

module.exports = UploadManager;

/**
 * Mappt session_id => progress
 * (Pro session_id nur eine Datei gleichzeitig hochladbar)
 *
 * @var object
 */
UploadManager._upload_progess = {};

/**
 * Mappt session_id => foldername
 *
 * @var object
 */
UploadManager._upload_foldername = {};

/**
 * Gibt den Upload-Progress für die angegebene Session-ID zurück.
 *
 * @param string session_id
 * @return int[2] [bytes_received, total]
 */
UploadManager.get_upload_progress = function(session_id) {
    session_id = FW.ValueChecker.string(session_id, 'session_id');
    return UploadManager._upload_progess[session_id];
}

UploadManager.setUploadFoldername = function(session_id, foldername) {
    session_id = FW.ValueChecker.string(session_id, 'session_id');
    foldername = FW.ValueChecker.string(foldername, 'foldername');
    UploadManager._upload_foldername[session_id] = foldername;
};

UploadManager.getUploadFoldername = function(session_id) {
    session_id = FW.ValueChecker.string(session_id, 'session_id');
    return UploadManager._upload_foldername[session_id];
};

UploadManager._getNextFreeFilename = function(filename, cb, basename, i) {
    filename = FW.ValueChecker.string(filename, 'filename');

    basename = basename || filename;
    i = i || 0;

    if (path.existsSync(filename)) {
        UploadManager._getNextFreeFilename(
            basename + '_' + i, cb, basename, i + 1
        );
    } else {
        cb(filename);
    }
}


UploadManager.prototype.log = function(message) {
    this._log_client.log(message);
};

UploadManager.prototype._checkFile = function(file_name, cb) {
    var ext = path.extname(file_name).toLowerCase().substring(1);
    for (i in Config.UPLOAD_ALLOWED_EXTENSIONS) {
        if (Config.UPLOAD_ALLOWED_EXTENSIONS[i] == ext) {
            cb(null, true);
            return;
        }
    }

    cb([ErrorCodes.DISALLOWED_FILETYPE, 'Filetype not allowed'])
    // ? _this._req.connection.destroy();
    
};

UploadManager.prototype.handleUpload = function(cb) {
    var _this = this;
    try {
        console.log(this._req.headers);
        if (this._req.headers['x-requested-with'] == 'XMLHttpRequest') {
            this._handleUploadRaw(cb);
        } else {
            cb([ErrorCodes.NOT_SUPPORTED, 'Please upload per XMLHttpRequest and set header[x-requested-with] == XMLHttpRequest']);
        }
    } catch (e) {
        console.log(e);
        console.log(JSON.stringify(e));
        this.log(e);
        cb([ErrorCodes.UNKNOWN, 'Unexpected error']);
    }
};

UploadManager.prototype._handleUploadRaw = function(cb) {
    if (this._req.headers['content-type'] != 'application/octet-stream') {
        cb([
            ErrorCodes.WRONG_CONTENT_TYPE, 
            'application/octet-stream expected']
        );
        return;
    } 
    var _this = this;
    var tmp_file = Config.TMP_DIR + '/' 
        + require('crypto').createHash('md5').update(
            Math.random().toString()
        ).digest('hex');
    var file_name = this._req.headers['x-file-name'] || 'unkown_filename';
    var expected_length = this._req.headers['content-length'];

    if (expected_length > Config.UPLOAD_SIZE_LIMIT) {
        this._req.connection.destroy();
        cb([ErrorCodes.UPLOAD_SIZE_LIMIT_EXCEEDED, 'Upload size exceeded']);
        return;
    }

    this._checkFile(file_name, function(err, res) {
        if (err) {
            console.log('filename disallowed: ' + file_name);
            cb(err);
        } else {
            console.log('filename OK');
            var os = fs.createWriteStream(tmp_file);
            var bytes_read = 0;

            _this._req.on('data', function(data) {
                bytes_read += data.length;
//                console.log(_this._req.session.id + ': ' + tmp_file + ': ' + bytes_read);
                if (bytes_read > Config.UPLOAD_SIZE_LIMIT) {
                    _this._req.connection.destroy();
                    os.destroy();
                    fs.unlinkSync(tmp_file);
                    cb([
                        ErrorCodes.UPLOAD_SIZE_LIMIT_EXCEEDED, 
                        'Upload size exceeded'
                    ]);
                } else {
                    os.write(data);
                }
            });

            var save_dir = _this._upload_dir + '/' 
                + UploadManager.getUploadFoldername(_this._req.session.id);

            console.log(save_dir);

            if (!path.existsSync(save_dir)) {
                fs.mkdirSync(save_dir);
            }

            console.log('ok');

            _this._req.on('end', function() {
                os.on('close', function() {
                    console.log('CLOSE:' + tmp_file + ':' + file_name);
                    var is = fs.createReadStream(tmp_file);

                    UploadManager._getNextFreeFilename(
                        save_dir + '/' + file_name, 
                        function(dest_filename) {
                            console.log('New file uploaded: ' 
                                + dest_filename + ', ' 
                                + bytes_read + '/' + expected_length);
                            var os2 = fs.createWriteStream(
                                dest_filename, {'mode': 0600}
                            );

                            util.pump(is, os2, function() {
                                fs.unlinkSync(tmp_file);
                                cb(null, true);
                            });
                        }
                    );
                });

                os.end();
                console.log('END');
            });
        }
    });
};
/* OLD and not supported anymore 
UploadManager.prototype._handleUploadForm = function(cb) {
    var form = new Formidable.IncomingForm();
    form.uploadDir = Config.TMP_DIR;
    var save_dir = this._upload_dir;
    var file_name;

    form
        .on('fileBegin', function(field, file) {
            this._checkFile(file.name, function(err, res) {
                if (err) {
                    // Wir halten hier jetzt den upload an, weil
                    // wir solche Files nicht akzeptieren wollen.
                    // Da wir Node nicht davon abhalten können, 
                    // den Rest der Datei zu empfangen, können  
                    // wir nur die Bearbeitung abbrechen.
                    // Das machen wir, indem wir alle Listeners 
                    // killen und die Datei nach /dev/null 
                    // umleiten.
                    // Dann geben wir die Abort-Seite aus 
                    // => fertig.
                    form.removeAllListeners('data');
                    form.removeAllListeners('file');
                    form.removeAllListeners('field');
                    form.removeAllListeners('end');
                    file.path = '/dev/null';
                    cb(err);
                }
            });
        })
        .on('progress', function(bytes_received, bytes_total) {
            if (!UploadManager._upload_progess[_this._req.session.id]) {  
                UploadManager._upload_progess[_this._req.session.id] = {};
            }
            UploadManager._upload_progess[_this._req.session.id][file_name] =
                [bytes_received, bytes_total]
        })
        .on('file', function(field, file) {
            console.log(field, file);
            files.push([field, file]);
        })
        .on('aborted', function() {
            if (path.existsSync(files[0][1].path))
                fs.unlinkSync(files[0][1].path);
        })
        .on('end', function() {
            var is = fs.createReadStream(files[0][1].path);

            UploadManager._getNextFreeFilename(
                save_dir + '/' + files[0][1].name, 
                function(dest_filename) {
                    _this.log('New file uploaded: ' 
                        + dest_filename);
                    var os = fs.createWriteStream(
                        dest_filename, {'mode': 0600}
                    );

                    util.pump(is, os, function() {
                        fs.unlinkSync(files[0][1].path);
                    });

                    cb(null, true);
                }
            );
        });
    form.parse(this._req);
};*/

var ValueChecker = require('./FW/ValueChecker'),
    Http = require('http'),
    EventEmitter = require('events').EventEmitter,
    Util = require('util');

/**
 * Das ist ein passender Client zum Logging-Server.
 *
 * @author Philipp Kemmeter
 */
LogClient = function(ip, port) {
    EventEmitter.call(this);
    this.ip = ValueChecker.string(ip, 'ip', false, 7);
    this.port = ValueChecker.int(port, 'port', 1);
    console.log(this.ip + ':' + this.port);
};

Util.inherits(LogClient, EventEmitter);

module.exports = LogClient;

LogClient.prototype.log = function(message, cb) {
    console.log(message);
    var req = Http.request(
        {
            host: this.ip,
            port: this.port,
            method: 'POST'
        },
        function (res) { if (cb) cb(res); }
    );
    _this = this;
    req.on('error', function(e) {
        if (this.listeners.length > 0) {
            _this.emit('error', e);
        } else {
            throw e;
        }
    });
    req.write(message);
    req.end();
};

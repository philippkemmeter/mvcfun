/**
 * This class manages api requests.
 *
 * @author Philipp Kemmeter
 */
var Base = require('./Base.js'),
    util = require('util'),
    http = require('http'),
    FW = require('philfw');

/**
 * Creates a new api object.
 *
 * @param object session       Session data object.
 * @param LogClient log_client Client for logging.
 * @param RespMan resp_manager Response mananger.
 */
var Api = function(session, log_client, resp_manager) {
    Base.call(this, session, log_client, resp_manager);
    this._api = {};
};

util.inherits(Api, Base);

module.exports = Api;

/**
 * Sets the API to use.
 *
 * It has to have the shape like
 * api.POST.method
 *
 * or similar.
 *
 * @param object api Api.
 * @see ::run
 */
Api.prototype.setApi = function(api) {
    this._api = api;
};

/**
 * Returns the api object.
 *
 * @return object
 */
Api.prototype.getApi = function() {
    return api;
};

/**
 * Wrapps the api result to a json that will be written using the response
 * manager.
 *
 * @param http.ServerResponse resp Response object.
 * @param Array err                Error array [CODE, MESSAGE].
 * @param object result            Result object. May be string.
 */
Api.prototype._write = function(resp, err, result) {
    if (err)
        result = null;
    else
        err = null;

    this._resp_manager.writeJson(
        resp,
        {
            err: err,
            result: result,
            sid: this._session.id
        }
    );
};

/**
 * Handles an api Request defined by the given parameters.
 *
 * The command will be resolved as follows:
 *
 * - /my/fancy/command via POST will fire
 *   this._api.POST.my.fancy.command
 * - The result will be written to the response object as a json having the
 *   following keys: err, result, sid.
 *
 * @param String command           Formed like a path.
 * @param String method            The method (POST or GET etc).
 * @param object data              Statics won't receive any params.
 * @param http.ServerResponse resp Server response Object. Write your data into
 *                                 this object directly.
 */
Api.prototype.run = function(command, method, data, resp) {
    FW.ValueChecker.string(command, 'command', true);
    FW.ValueChecker.instance_of(resp, 'resp', http.ServerResponse);

    var _this = this;
    command_arr = command.split('/');

    var error = false;
    var api_o = null;
    if (typeof(this._api[method]) == 'undefined') {
        error = true;
    } else {
        api_o = this._api[method];
        for (var i = 0; i < command_arr.length; ++i) {
            if (typeof(api_o[command_arr[i]]) == 'undefined') {
                error = true;
                break;
            }
            api_o = api_o[command_arr[i]];
        }
    }

    if (error) {
        this._write(
            resp,
            [-1, 'Command ' + command + ' unknown'],
            null
        );
    } else {
        try {
            api_o(
                data,
                this._session,
                {},
                function(err, result) {
                    _this._write(
                        resp, err, result
                    );
                }
            );
        }
        catch (e) {
            console.log(e);
            this._write(
                resp, [-1, e], null
            );
        }
    }
}

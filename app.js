#!/usr/bin/node

var Http = require('http'),
    HTTPStatusCodes = require('./lib/HTTPStatusCodes.js'),
    util = require('util'),
    url = require('url'),
    fs = require('fs'),
    path = require('path'),
    FW = require('philfw'),
    Mime = require('./lib/Mime.js'),
    LogClient = require('./lib/LogClient.js'),
    RespMan = require('./lib/response/Manager.js'),
    ReqMan = require('./lib/request/Manager.js');

require('sesh').magicSession();

var App = {};

App.log_client = new LogClient('127.0.0.1', 8090);
App.log_client.on('error', function(e) { console.log(e) });
App.log = function(msg) {
    console.log(msg);
    try {
        App.log_client.log(msg);
    } catch (e) {
        try {
            App.log_client.log(JSON.stringify(msg));
        } catch (e) {
            console.log(e);
        }
    }
};

App.resp_manager = new RespMan(App.log_client);

App.req_manager = new ReqMan(
    {}, App.log_client, App.resp_manager
);

App.server = Http.createServer(function(req, resp) {
    try {
        var command = FW.ltrim(req.url.split('?')[0], '/');
        var get_params = url.parse(req.url, true).query || {};

        App.req_manager.setSession(req.session);

        if (req.method == 'POST') {
            if (command == 'upload') {
                // TODO make this more dynamic - maybe a controller for this?
                App.req_manager.handleUpload(req, resp);
            } else {

                // POST request

                var d = '';

                req.on('data', function(data) {
                    if (d.length > 1000) {
                        // FLOOD ATTACK OR FAULTY CLIENT OR NUKE OR WHATEVER!
                        req.connection.destroy();
                    }

                    d += data;
                });

                req.on('end', function() {
                    try {
                        var POST = JSON.parse(d);
                    } catch (e) {
                        var POST = d;
                    }

                    App.req_manager.run(command, 'POST', POST, resp);
                });
            }
        } else {
            var GET = url.parse(req.url, true).query || {};
            App.req_manager.run(command, req.method, GET, resp);
        }
    } catch(e) {
        console.log(e);

        try {
            e = JSON.stringify(e);
        } catch (xy) {
            e = 'Unknown';
        }
        App.resp_manager.writeInternalServerError(resp, e);
    }
}).listen(8080);

console.log('listening on http://localhost:' + 8080 + '/');

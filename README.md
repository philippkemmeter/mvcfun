# MVCfun

MVCfun is an model-view-controller based web server framework. 

Register controllers to ressource paths. You may use regular expressions for
this to register a controller to a bunch of paths at once.

This project is under high development and new features pop out every week.
Contributers are very welcome.

## Quick example

    var mvcfun     = require('mvcfun'),
        controller = mvcfun.controller,
        regexp     = mvcfun.regexp;

    var server = (new mvcfun.http.Server())
        .listen(8080)
        .on('error', function(err) {
            console.log(err.stack);
            server.close(function() { process.exit(1) });
        });

    server.addController(new controller.Static(regexp.files));
    server.addController(new controller.Forbidden(regexp.directories));

This creates an http server listening on port 8080. It serves all static files
located relatively to the default directory 'htdocs' and forbid any access to
directories.

## Key features

    - MVC based developing the cool way
    - High unit test coverage
    - RESTFul developing possible in same framework

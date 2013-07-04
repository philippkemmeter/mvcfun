# MVCfun

MVCfun is an model-view-controller based web server framework. 

Register controllers to ressource paths. You may use regular expressions for
this to register a controller to a bunch of paths at once.

This project is under high development and new features pop out every week.
**Contributers are very welcome.**

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

## Why MVC

The model-view-controller pattern is well known in web development. Using this
pattern makes code more readable and maintable without loosing performance.

## Key features

    - MVC based developing the cool way
    - Maintainable code
    - Increadibly fast
    - RESTFul developing possible in same framework
    - Swig template engine included
    - High unit test coverage

## Installation

### Fast way using npm

The most simple way to install MVCfun is using npm:

    npm install mvcfun

There you will get the last stable release containing all features.

### Custom installation

MVCfun is organized in branches. Each branch has its own set of features. For
instance the *swig* branch contains swig binding and a swig base controller.

If you want the naked framework, checkout the *minimal* branch. You may merge
as many of the feature branches together as you want. 

The *master* branch contains all features merged together and the versions
published in npm come from the master branch.

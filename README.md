FerrumJS [alfa]
=========

What is it?
-----------

FerrumJS is simple and powerfull web server for [node.js](http://nodejs.org). It's designed for quick and simple development of high-performance application. Just try it.

Instalation
-----------

`npm install`

Documentation
-------------

Up-to date documentation can be found at [http://jsdoc.info/SergeZ/ferrum/](http://jsdoc.info/SergeZ/ferrum/)


Usage
-----

```js
var util = require('util');
var ferrum = require('ferrum');

function MainHandler () {
    ferrum.RequestHandler.call(this);
    
    this.get = function () {
        this.write("Hello world!");
    };
}

util.inherits(MainHandler, ferrum.RequestHandler);

ferrum.Application({
    port: process.env.PORT,
    address: process.env.IP,
    routes: {
        '^/$': MainHandler
    }
}).run();
```

License
-------

Please see the file called LICENSE.
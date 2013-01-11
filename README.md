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

Up-to date documentation can be found at [http://jsdoc.info/SergeZ/FerrumJS/](http://jsdoc.info/SergeZ/FerrumJS/)


Usage
-----

```js
var ferrum = require("ferrum");

var MainHandler = ferrum.RequestHandler.extend({
    get: function () {
        this.write("Hello world!");
    }
});

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
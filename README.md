Ferrum [alfa] [![Build Status](https://travis-ci.org/sergez/ferrum.png?branch=master)](ferrum)
=========

What is it?
-----------

Ferrum is simple and powerfull framework for [node.js](http://nodejs.org). It's designed for quick and simple development of high-performance application.

Instalation
-----------

`npm install ferrum`

Documentation
-------------

In progress


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

The MIT License (MIT)

Copyright (c) 2012 Sergey Zvinsky s.zvinsky@gmail.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
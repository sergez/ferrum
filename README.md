Ferrum [alfa] [![Build Status](https://travis-ci.org/sergez/ferrum.png?branch=master)](ferrum)
=========

What is it?
-----------

Ferrum is simple and powerful framework for [node.js](http://nodejs.org). It's designed for quick and simple development of high-performance application. Ferrum don't force you to organize your code how it wants - it's up to you and i suppose it gives some flexibility in development of apps.

Instalation
-----------

`npm install ferrum`

Hello, word
-----------
Here is an example of Ferrum app:

```js
var util = require('util');
var ferrum = require('ferrum');

function MainHandler () {
    ferrum.RequestHandler.call(this);
    
    this.get = function () {
        this.write("Hello, world!");
    };
}

util.inherits(MainHandler, ferrum.RequestHandler);

ferrum.Application({
    routes: {
        '^/$': MainHandler
    }
}).run();
```

Then type http://localhost:8888  in browser address bar and enjoy.

Usage
-----

* [Request handlers and arguments](#request-handlers-and-arguments)
* [Query params](#query-params)


Request handlers and arguments
------------------------------
In Ferrum application every URL or URL expression corresponds to handler based on `ferrum.RequestHandler`. This handler contains methods for processing GET, POST and others of http requests.

Allowed http-methods and appropriate ferrum methods are:

* GET       > get()
* POST      > post()
* PATCH     > patch()
* PUT       > put()
* DELETE    > del()
* HEAD      > head()
* OPTIONS   > options()


In following example the root path `/` points to MainHandler and the URL expression `/user/([0-9]+)` to UserHandler. Apart of that regular expression groups are passed as arguments to UserHandler handler.

```
function MainHandler () {
    ferrum.RequestHandler.call(this);
    
    this.get = function () {
        ...
    };
}
util.inherits(MainHandler, ferrum.RequestHandler);


fuction UserHandler () {
    ferrum.RequestHandler.call(this);
    
    this.get = function (userId) {
        ...
    };
}
util.inherits(UserHandler, ferrum.RequestHandler);

ferrum.Application({
    routes: {
        '^/$': MainHandler,
        '^/user/([0-9]+)$': UserHandler
    }
}).run();

```

Query params
------------
To work with query paramenters ferrum use third-party component [qs](https://npmjs.org/package/qs). The result of parsing query string is available in `ferrum.Request` object.

```
// GET http://localhost/params?params1=value1&params2=value2

function ParamsHandler, () {
    ferrum.RequestHandler.call(this);
    
    this.get = function () {
        this.write(JSON.stringify(this.request.query));
        // => {"params1":"value1","params2":"value2"}
    };
}
util.inherits(ParamsHandler, ferrum.RequestHandler);

ferrum.Application({
  routes: {
    	'^/params$': ParamsHandler
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
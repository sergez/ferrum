var util = require('util');
var ferrum = require('../lib/index');

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
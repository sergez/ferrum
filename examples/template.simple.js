var util = require('util');
var ferrum = require('../lib/index');

function MainHandler () {
    ferrum.RequestHandler.call(this);
    
    this.get = function () {
      this.render('index', { "variable": "test variable" });
    };
}

util.inherits(MainHandler, ferrum.RequestHandler);

ferrum.Application({
  viewsPath: './examples/views',
  routes: {
    '^/$': MainHandler
  }
}).run();
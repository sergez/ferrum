/**
 * Provides the base RequestHandler and StaticHandler classes
 * 
 * @module request
 */
var util = require('util');
var path = require("path");
var fs = require("fs");

var Request = require('./request').Request;
var Cookies = require('cookies');
var keys = require('keygrip')();
var dust = require('dustjs-linkedin');

/**
 * Private variables
 */
var allowedMethods = {
  'GET': 'get',
  'POST': 'post',
  'PATCH': 'patch',
  'PUT': 'put',
  'DELETE': 'del',
  'HEAD': 'head',
  'OPTIONS': 'options'
};

/**
 * Creates an instance of RequestHandler
 * 
 * @class RequestHandler
 * @constructor
 */
function RequestHandler () {
  
  var self = this;
  
  this.handle = function (o) {
    this.method = o.request.method.toUpperCase();
    this.request = Request(o.request, o.application);
    this.response = o.response;
    this.cookies = new Cookies(o.request, o.response, keys);
    this.application = o.application;
    
    this.request.on('ready', function onRequestReady () {
      self.header.setDefault();
    
      var isMethodLegal = (allowedMethods.hasOwnProperty(self.method) && self[allowedMethods[self.method]]);
      
      if (isMethodLegal) {
         self[allowedMethods[self.method]].apply(self, o.extraParams);
      } else {
        self.application.logger.warn(util.format('Method "%s" is not allowed', self.method));
        self.response.statusCode = 405;
        self.response.end();
      }
    });
    
    this.request.start();
  };
}

/**
 * Writes the given string to response
 * 
 * @this {RequestHandler}
 * @param {String} string
 * @api public
 */
RequestHandler.prototype.write = function (string) {
  if (typeof string !== 'string') {
    string = ((string && typeof string['toString'] !== 'undefined') ? string.toString() : '');
  }
  this.header.set('Content-Length', Buffer.byteLength(string, 'utf8'));
  this.response.end(string);
};

/**
 * Render template `view` with data `data` and writes the given result to response
 * 
 * @this {RequestHandler}
 * @param {String} view Template's filename
 * @param {Object} JSON object
 * @api public
 */
RequestHandler.prototype.render = function (view, data) {
  var self = this;
    var viewPath = fs.realpathSync(this.application.options.views);

    // TODO : handling of error if file doesn't exists
    //console.log(viewPath);

    dust.onLoad = function onLoad (name, callback) {
        // name = name.replace(/\.html$/, '') + '.html';
        fs.readFile(path.join(viewPath, name), 'utf8', callback);
    };

    dust.render(view, data, function onRender (error, output) {
        self.write(output);
    });
};

RequestHandler.prototype.__defineGetter__('header', function() {
  
  var self = this;
  
  return {
    /**
     * Reset all headers to default
     * 
     * @this {RequestHandler}
     * @api private
     */
    setDefault: function () {
      this.set('server', 'Ferrum 0.1a');
      this.set('content-type', 'text/html; charset=UTF-8');
    },
    
    set: function (name, value) {
      self.response.setHeader(name, value);
    },
    
    get: function (name, defaultValue) {
      return self.response.getHeader(name) || defaultValue;
    },
    
    clear: function () {
      //response.removeHeader("Content-Encoding");
    }
  };
  
});

function StaticRequestHandler () {
  RequestHandler.call(this);
}
util.inherits(StaticRequestHandler, RequestHandler);

module.exports.StaticRequestHandler = StaticRequestHandler;
module.exports.RequestHandler = RequestHandler;
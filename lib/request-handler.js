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

var mime = require('./static/mime');

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
}

RequestHandler.prototype.run = function (options) {
  var self = this;
  
  this.method = options.request.method.toUpperCase();
  this.request = Request(options.request, options.application);
  this.response = options.response;
  this.cookies = new Cookies(options.request, options.response, keys);
  this.application = options.application;
  
  this.request.on('ready', function onRequestReady () {
    self.header.setDefault();
  
    var isMethodLegal = (allowedMethods.hasOwnProperty(self.method) && self[allowedMethods[self.method]]);
    
    if (isMethodLegal) {
       self[allowedMethods[self.method]].apply(self, options.extraParams);
    } else {
      self.application.logger.warn(util.format('Method "%s" is not allowed', self.method));
      self.response.statusCode = 405;
      self.response.end();
    }
  });
  
  this.request.start();
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
  
  this.application.templateEngine.once('render', function (output) {
    self.write(output);
  });
  
  this.application.templateEngine.once('error', function (error) {
    self.application.logger.warn(error);
    self.response.statusCode = 500;
    self.response.end();
  });
    
  this.application.templateEngine.render(view, data);
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
  
  this.get = function (path) {
    this.serveFile(path);
  };
  
  this.head = function (path) {
    this.serveFile(path);
  };
}
util.inherits(StaticRequestHandler, RequestHandler);

StaticRequestHandler.prototype.serveFile = function (filePath) {
  //this.defaultHeaders['cache-control'] = 'max-age=' + this.cache; 
  
  var self = this;
  var ifNoneMatch = this.request.getHeader('if-none-match');
  var ifModifiedSince = Date.parse(this.request.getHeader('if-modified-since'));
  
  filePath = path.resolve(path.join(this.application.staticPath, filePath));
  
  fs.exists(filePath, existsCb);
  
  function existsCb (exists) {
    if (!exists) {
      self.application.logger.warn(util.format('File "%s" is not found', filePath));
      self.response.statusCode = 404;
      self.response.end();
      return;
    }
    
    fs.stat(filePath, function (error, fileStat) {
      var mtime = Date.parse(fileStat.mtime);
      var etag = JSON.stringify([fileStat.ino, fileStat.size, mtime].join('-'));
      var date = new(Date)().toUTCString();
      var lastModified = new(Date)(fileStat.mtime).toUTCString();
      var headers = {
        'etag': etag,
        'date': date,
        'last-modified': lastModified
      };
      
      var isCacheHeaders = ifNoneMatch || ifModifiedSince;
      var isEtagMatched = !ifNoneMatch || ifNoneMatch == etag;
      var isModifiedDateLess = !ifModifiedSince || ifModifiedSince >= mtime;
      
      if (isCacheHeaders && isEtagMatched && isModifiedDateLess) {
          self.response.writeHead('304', headers);
          self.response.end();
          return;
      } else {
        var fileExtension = path.extname(filePath).slice(1).toLowerCase();
        headers['content-length'] = fileStat.size,
        headers['content-type'] = mime.contentTypes[fileExtension] || 'application/octet-stream';
        
        self.response.writeHead(200, headers);
        
        // Stream the file to the client
        var readStream = fs.createReadStream(filePath, {
          flags: 'r',
          mode: 0666
        });
        
        readStream.on("error", function(error) {
          self.response.end();
        });
        
        readStream.on("end",  function(){
          self.response.end();
        });
        
        readStream.on("open", function () {
          readStream.pipe(self.response, {end: false});
        });
      }
    });
  }
};

module.exports.StaticRequestHandler = StaticRequestHandler;
module.exports.RequestHandler = RequestHandler;
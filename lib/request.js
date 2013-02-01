/**
 * Provides the base Request class
 * 
 * @module request
 */
var url = require('url');
var util = require('util');
var events = require('events');

var qs = require('qs');
var querystring = require('querystring');
var formidable = require('formidable');

/**
 * Creates ...
 * 
 * @class Request
 * @constructor
 * @param {Object} request Request object provides by node.js
 * @param {Object} application Application instance
 */ 
function Request(request, application) {
  if (!(this instanceof Request)) {
    return new Request(request, application);
  }
  
  events.EventEmitter.call(this);
  
  this.application = application;
  this.request = request;
  this.method = this.request.method.toUpperCase();
  this.query = {};
  this.files = {};
}

util.inherits(Request, events.EventEmitter);

/**
* Start processing of client request
*
* @method start
* @for Request
*/
Request.prototype.start = function () {
  this._parseQueryParams();
};

/**
* Reads request header. Note that the name is case insensitive.
*
* @method getHeader
* @param {String} name Name of header
* @return Value of header
* @for Request
*/
Request.prototype.getHeader = function (name) {
  return this.request.headers[name];
};

/**
* Parses GET/POST query params
*
* @method _parseQueryParams
* @private
* @for Request
*/
Request.prototype._parseQueryParams = function () {
  var urlQuerystring;
  var form;
  var self = this;
  
  if (this.method == "GET") {
    urlQuerystring = url.parse(this.request.url).query;
    
    this.query = qs.parse(urlQuerystring);
    
    this.emit("ready");
  } else if (this.method == "POST" && this.getHeader('content-length') > 0) {
      form = new formidable.IncomingForm();
      
      form.uploadDir = this.application.options.uploads.dir;

      form.parse(this.request, function onParse (err, fields, files) {
        self.query = qs.parse(querystring.stringify(fields));
        self.files = files;
        self.emit("ready");
      });
  } else {
      this.emit("ready");
  }
};

module.exports.Request = Request;
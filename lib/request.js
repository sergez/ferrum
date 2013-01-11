var url = require('url');
var util = require('util');
var events = require('events');

var qs = require('qs');
var querystring = require('querystring');
var formidable = require('formidable');

/**
 * 
 * 
 * 
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

Request.prototype.start = function () {
  this._parseQueryParams();
};

Request.prototype.getHeader = function (name) {
  return this.request.headers[name];
};

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
      
      form.uploadDir = this.application.options.fileUploadDir;
      /*form.on('field', function(field, value) {
              self.query[field] = value;
          })
          .on('file', function(field, file) {
              self.files[field] = file;
          })
          .on('end', function() {
              self.emit("ready");
          });*/

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
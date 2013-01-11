/**
 * Module dependencies
 */
var http = require('http');
var path = require('path');
var util = require('util');

var _ = require('lodash');
var winston = require('winston');

/**
 * Private variables
 */
var requestHandler = require('./request-handler');
var RequestListener = require('./request-listener').RequestListener;

/**
 * Creates an instance of Application
 * 
 * @constructor
 * @this {Application}
 * @param {Object} options
 * @api public
 */
function Application (options) {
  if (!(this instanceof Application)) {
    return new Application(options);
  }

  var appInstance = this;
  var defaults = {
    // Listen
    address: '127.0.0.1',
    port: '8888',
    
    //
    routes: {},
    
    // Debug mode
    debugMode: false,
    
    // Logger options
    logger: {
      filename: false,
      handleExceptions: false,
      exitOnError: true,
      json: true
    },
    loggerTransports: false,
    
    staticFilepath: "./static/",
    views: "./tpl/",
    
    // uploads
    fileUploadDir: "./uploads/"
  };
  
  var o = this.options = _.defaults(options || {}, defaults);
  
  o.routes['^/static/(.*)$'] = new requestHandler.StaticRequestHandler();
  
  this.server = {};
    
  //Initialize logger
  this.logger = new (winston.Logger)();
  
  // Console as defaul logger transport
  this.logger.add(winston.transports.Console, {
    level: (o.debugMode ? 'info' : 'warn'),
    handleExceptions: true
  });
  
  // Add file transport if there is log filename
  var isFilename = (o.logger && o.logger.filename);
  if (isFilename) {
    var logFileDirname = path.dirname(o.logger.filename);
    
    if (path.existsSync(logFileDirname)) {
      this.logger.add(winston.transports.File, o.logger);
    } else {
      this.logger.warn(util.format('Directory "%s" doesn\'t exist', logFileDirname));
    }
  }
  
  // User defined logger transports
  if (o.loggerTransports) {
    o.loggerTransports.forEach(loggerTransportsIterator);
  }
  
  function loggerTransportsIterator (transport) {
    if (transport.transport && transport.options) {
      appInstance.logger.add(transport.transport, transport.options);
    }
  }
}

Application.prototype.run = function () {
  var o = this.options;
    
  this.server = http.createServer(RequestListener(this)).listen(o.port, o.address);
  this.logger.info('Application is started at: %s:%s', o.address, o.port);
};

Application.prototype.stop = function () {
  this.server.close(function onServerClose () { this.logger.info('Application is stopped'); });
};

module.exports.Application = Application;
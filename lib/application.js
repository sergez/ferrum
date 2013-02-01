/**
 * Provides the base Application class
 * 
 * @module application
 */
var http = require('http');
var path = require('path');
var util = require('util');

var _ = require('lodash');
var winston = require('winston');

var StaticRequestHandler = require('./request-handler').StaticRequestHandler;
var RequestListener = require('./request-listener').RequestListener;
var DustEngine = require('./template-engine/dust-engine').DustEngine;

/**
 * Creates an instance of Application
 * 
 *        var util = require('util');
 *        var ferrum = require('ferrum');
 * 
 *        var options = {
 *          routes: {
 *            '^/$': MainHandler
 *          }
 *        };
 * 
 *        function MainHandler () {
 *          ferrum.RequestHandler.call(this);
 * 
 *          this.get = function () {
 *            this.write("Hello world!");
 *          };
 *        }
 *        util.inherits(MainHandler, ferrum.RequestHandler);
 * 
 *        ferrum.Application(options).run();
 * 
 * @class Application
 * @constructor
 * @chainable
 * @param {Object} options Application options
 *  @param {String} [options.host] A domain name or IP address of the server to handle the requests. 'localhost' by default.
 *  @param {String} [options.port] Port of the server to be listened. '8888' by default.
 *  @param {Object} [options.routes] Dictionary of application routes. Where 'keys' are route paths and 'values' are their handlers.
 *  By default it includes only route for static files.
 *  @param {Boolean} [options.debugMode] Defines logger level and other staff needed for debugging. 'false' by default.
 *  @param {Object} [options.logger] ...
 *  @param {Array} [options.loggerTransports] Array of extra logger transports. You can add other transports which supported by winston.
 *  List of existing transport you can find here - https://github.com/flatiron/winston#working-with-transports.
 *  By default `ferrum` includes `File` and `Console` transports.
 *  @param {Object} [options.static] Settings of static file
 *  @param {String} [options.views] Path for templates. './views/' by default.
 *  @param {Object} [options.uploads] Setting for uploads.
 * @return {Object} Application instance.
 */
function Application (options) {
  if (!(this instanceof Application)) {
    return new Application(options);
  }

  var self = this;
  var defaults = {
    // Application host and port
    host: 'localhost',
    port: '8888',
    
    // Routes
    routes: {},
    
    // Debug/developer mode
    debugMode: false,
    
    // Logger
    logger: {
      filename: false,
      handleExceptions: false,
      exitOnError: true,
      json: true
    },
    loggerTransports: false,
    
    // Static files
    static: {
      path: false,
      cache: 3600
    },
    
    // Template engine.record
    views: './views/',
    
    // Uploads
    uploads: {
      dir: './uploads/'
    },
    
    templateEngine: false
  };
  
  var o = this.options = _.defaults(options || {}, defaults);
  
  if (o.static.path) {
    o.routes['^/static/(.*)$'] = StaticRequestHandler;
  }
  
  if (!o.templateEngine) {
    o.templateEngine = new DustEngine({viewsDir: o.views});
  }
  
  this.server = {};
    
  // Initialize logger
  this.logger = new (winston.Logger)();
  
  // Console as default logger transport
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
      self.logger.add(transport.transport, transport.options);
    }
  }
}

/**
* Runs application
*
* @method run
* @for Application
* @uses RequestListener
*/
Application.prototype.run = function () {
  var o = this.options;
    
  this.server = http.createServer(RequestListener(this)).listen(o.port, o.host);
  this.logger.info('Application is started at: %s:%s', o.host, o.port);
};

/**
* Stops application
*
* @method stop
* @for Application
*/
Application.prototype.stop = function () {
  this.server.close(function onServerClose () { this.logger.info('Application is stopped'); });
};

module.exports.Application = Application;
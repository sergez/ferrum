/**
 * Provides the base Application class
 * 
 * @module application
 */
var http = require('http');
var path = require('path');
var util = require('util');

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
  
  options                 = options || {};
  this.host               = options.host || 'localhost';
  this.port               = options.port || '8888';
  
  this.routes             = options.routes || {};
  
  this.debugMode          = options.debugMode || false;
  
  // Logger
  this.logFilename        = options.logFilename || '';
  this.logHandleExeptions = options.logHandleExeptions || false;
  this.logExitOnError     = options.logExitOnError || true;
  this.logJSON            = options.logJSON || true;
  
  this.logTransports      = options.logTransports || [];
  
  // Statics
  this.staticPath         = options.staticPath || '';
  
  // Views
  this.viewsPath          = options.viewsPath || '';
  
  this.uploadsDir         = options.uploadsDir || '';
  
  //
  this.templateEngine     = options.templateEngine || null;
  
  if (this.staticPath) {
    this.routes['^/static/(.*)$'] = StaticRequestHandler;
  }
  
  if (!this.templateEngine) {
    this.templateEngine = new DustEngine({viewsDir: this.viewsPath});
  }
  
  this.server = {};
    
  // Initialize logger
  this.logger = new (winston.Logger)();
  
  // Console as default logger transport
  this.logger.add(winston.transports.Console, {
    level: (this.debugMode ? 'info' : 'warn'),
    handleExceptions: true
  });
  
  // Add file transport if there is log filename
  if (this.logFilename) {
    var logFileDirname = path.dirname(this.logFilename);
    
    if (path.existsSync(logFileDirname)) {
      this.logger.add(winston.transports.File, {
        filename: this.logFilename,
        exitOnError: this.logExitOnError,
        handleExceptions: this.logHandleExeptions,
        json: this.logJSON
      });
    } else {
      this.logger.warn(util.format('Directory "%s" doesn\'t exist', logFileDirname));
    }
  }
  
  // User defined logger transports
  if (this.logTransports) {
    this.logTransports.forEach(loggerTransportsIterator);
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
  this.server = http.createServer(RequestListener(this)).listen(this.port, this.host);
  this.logger.info('Application is started at: %s:%s', this.host, this.port);
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
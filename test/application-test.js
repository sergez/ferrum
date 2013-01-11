/**
 * Module dependencies
 */
var vows = require('vows'),
  assert = require('assert'),    
  fs = require("fs"),
  winston = require("winston"),    
  events = require("events"),
  path = require("path"),
  
  ferrum = require("../lib/index"),
  requestHandler = require("../lib/request-handler");
  
var logDirExists = path.join(process.cwd(), "./test/directory-exists"),
  logPathExists = path.join(process.cwd(), "./test/directory-exists/app.log"),
  logPathDoesNotExists = path.join(process.cwd(), "./test/dir-doesn't-exists/app.log");

// Ferrum :: Application Test Suite
vows.describe("Ferrum").addBatch({
  "Application": {  
    topic: ferrum.Application(),
  
    "should be defined": function (app) {
      assert.isObject(app);
      assert.instanceOf(app, ferrum.Application);
    },
  
    "should be methods defined correctly": function (app) {
      assert.isObject(app.options);
      assert.isObject(app.logger);
      assert.instanceOf(app.logger, winston.Logger);
 
      assert.isFunction(app.run);
      assert.isFunction(app.stop);
    },
        
    "should be static router as default": function (app) {
      assert.lengthOf(app.options.routes, 1);
      assert.instanceOf(app.options.routes['^/static/(.*)$'], requestHandler.StaticRequestHandler);
    },
  
    "should be Console as default logger transport": function (app) {
      assert.isObject(app.logger.transports);
      assert.lengthOf(app.logger.transports, 1);
      assert.instanceOf(app.logger.transports["console"], winston.transports.Console);
    },
  
    "Console transport should have correct logging options": function (app) {
      assert.equal(app.logger.transports["console"].level, "warn");
      assert.isTrue(app.logger.transports["console"].handleExceptions);
    }
  },
    
  "Application :: Logger :: debugMode = true": {
    topic: ferrum.Application({
      debugMode: true
    }),
  
    "Console transport should have correct logging options": function (app) {
      assert.equal(app.logger.transports["console"].level, "info");
      assert.isTrue(app.logger.transports["console"].handleExceptions);
    }
  },
  
  "Application :: Logger :: Transports": {
    topic: ferrum.Application({
      loggerTransports: [{
        transport: winston.transports.File,
        options: { filename: logPathDoesNotExists }
      }]
    }),
        
    "should be two logger transport - Console and File": function (app) {
      assert.isObject(app.logger.transports);
      assert.lengthOf(app.logger.transports, 2);
      assert.instanceOf(app.logger.transports["console"], winston.transports.Console);
      assert.instanceOf(app.logger.transports["file"], winston.transports.File);
    }
  },
    
  "Application :: Logger :: Path/Directory doesn't exists": {
    topic: ferrum.Application({
      logger: {
        filename: logPathDoesNotExists
      }
    }),
  
    "should be one logger transport - Console": function (app) {
      assert.isObject(app.logger.transports);
      assert.lengthOf(app.logger.transports, 1);
      assert.instanceOf(app.logger.transports["console"], winston.transports.Console);
    }
  },
  
  "Application :: Logger :: Path/Directory exists": {
    topic: function () {
      var promise = new events.EventEmitter();
  
      fs.mkdir( logDirExists, "0777", function (err) {
        var app = ferrum.Application({
          logger: {
            filename: logPathExists
          }
        });
        promise.emit("success", app);
      });
  
      return promise;
    },
    
    "should be two logger transport - Console and File": function (app) {
      assert.isObject(app.logger.transports);
      assert.lengthOf(app.logger.transports, 2);
      assert.instanceOf(app.logger.transports["console"], winston.transports.Console);
      assert.instanceOf(app.logger.transports["file"], winston.transports.File);
  
      fs.rmdir(logDirExists);
    }
  }
}).export(module);
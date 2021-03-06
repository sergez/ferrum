var vows = require('vows');
var assert = require('assert');
var fs = require('fs');
var winston = require('winston');
var events = require('events');
var path = require('path');

var ferrum = require('../lib/index');
  
var logDirExists = path.join(process.cwd(), './test/directory-exists');
var logPathExists = path.join(process.cwd(), './test/directory-exists/app.log');
var logPathDoesNotExists = path.join(process.cwd(), './test/dir-doesn-not-exists/app.log');

// Ferrum :: Application Test Suite
vows.describe('Ferrum/Application').addBatch({
  'Instance': {
    topic: ferrum.Application(),
    
    'should be defined': function (app) {
      assert.isObject(app);
      assert.instanceOf(app, ferrum.Application);
    },
  
    'should be methods defined correctly': function (app) {
      assert.isString(app.host);
      assert.isString(app.port);
      assert.isObject(app.routes);
      assert.isFalse(app.debugMode);
      assert.isString(app.logFilename);
      assert.isFalse(app.logHandleExeptions);
      assert.isTrue(app.logExitOnError);
      assert.isTrue(app.logJSON);
  
      assert.isArray(app.logTransports);
      assert.isString(app.staticPath);
      assert.isString(app.viewsPath);
      assert.isString(app.uploadsDir);
      assert.isObject(app.templateEngine);
  
      assert.isObject(app.logger);
      assert.instanceOf(app.logger, winston.Logger);
 
      assert.isFunction(app.run);
      assert.isFunction(app.stop);
    },
    
    'should not be static router as default': function (app) {
      assert.lengthOf(app.routes, 0);
    },
    
    'template engine should be defined': function (app) {
      assert.isObject(app.templateEngine);
    },
    
    'should be Console as default logger transport': function (app) {
      assert.isObject(app.logger.transports);
      assert.lengthOf(app.logger.transports, 1);
      assert.instanceOf(app.logger.transports.console, winston.transports.Console);
    },
    
    'console transport should have correct logging options': function (app) {
      assert.equal(app.logger.transports.console.level, 'warn');
      assert.isTrue(app.logger.transports.console.handleExceptions);
    }
  },
    
  'Logger :: debugMode = true': {
    topic: ferrum.Application({
      debugMode: true
    }),
  
    'Console transport should have correct logging options': function (app) {
      assert.equal(app.logger.transports.console.level, 'info');
      assert.isTrue(app.logger.transports.console.handleExceptions);
    }
  },
  
  'Logger :: Transports': {
    topic: ferrum.Application({
      logTransports: [{
        transport: winston.transports.File,
        options: { filename: logPathDoesNotExists }
      }]
    }),
        
    'should be two logger transport - Console and File': function (app) {
      assert.isObject(app.logger.transports);
      assert.lengthOf(app.logger.transports, 2);
      assert.instanceOf(app.logger.transports.console, winston.transports.Console);
      assert.instanceOf(app.logger.transports.file, winston.transports.File);
    }
  },
    
  'Logger :: Path/Directory does not exists': {
    topic: ferrum.Application({
      logFilename: logPathDoesNotExists
    }),
  
    'should be one logger transport - Console': function (app) {
      assert.isObject(app.logger.transports);
      assert.lengthOf(app.logger.transports, 1);
      assert.instanceOf(app.logger.transports.console, winston.transports.Console);
    }
  },
  
  'Logger :: Path/Directory exists': {
    topic: function () {
      var promise = new events.EventEmitter();
  
      fs.mkdir( logDirExists, '0777', function (err) {
        var app = ferrum.Application({
          logFilename: logPathExists
        });
        promise.emit('success', app);
      });
  
      return promise;
    },
    
    'should be two logger transport - Console and File': function (app) {
      assert.isObject(app.logger.transports);
      assert.lengthOf(app.logger.transports, 2);
      assert.instanceOf(app.logger.transports.console, winston.transports.Console);
      assert.instanceOf(app.logger.transports.file, winston.transports.File);
  
      fs.rmdir(logDirExists);
    }
  }
}).export(module);
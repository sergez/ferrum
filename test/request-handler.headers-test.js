/**
 * Module dependencies
 */
var vows = require('vows');
var assert = require('assert');
var util = require('util');
var client = require('needle');

var config = require('./config');
var ferrum = require('../lib/index');
var requestHandler = require('../lib/request-handler');

// ferrum :: Request Test Suite
vows.describe('ferrum/Request Handler/Headers').addBatch({
  'Request Handler': {
    topic: function () {
      // default handler
      function SetHeaderHandler () {
        requestHandler.RequestHandler.call(this);
        
        this.get = function () {
          this.header.set('Content-Type', 'text/xml; charset=cp-1251');
          this.response.end();
        };
      }
      util.inherits(SetHeaderHandler, requestHandler.RequestHandler);
      
      function GetHeaderHandler () {
        requestHandler.RequestHandler.call(this);
        
        this.get = function () {
          this.header.set('Content-Type', 'text/xml; charset=cp-1251');
          this.write(this.header.get('Content-Type'));
        };
      }
      util.inherits(GetHeaderHandler, requestHandler.RequestHandler);
      
      function GetHeaderDefaltValueHandler () {
        requestHandler.RequestHandler.call(this);
        
        this.get = function () {
          this.write(this.header.get('Content-Type-None-Exists', 'DefaultValue'));
        };
      }
      util.inherits(GetHeaderDefaltValueHandler, requestHandler.RequestHandler);
      
      function GetRequestHeaderHandler () {
        requestHandler.RequestHandler.call(this);
        
        this.get = function () {
          this.write(this.request.getHeader('user-agent'));
        };
      }
      util.inherits(GetRequestHeaderHandler, requestHandler.RequestHandler);
      
      function GetRequestHeaderDefaultValueHandler () {
        requestHandler.RequestHandler.call(this);
        
        this.get = function () {
          this.write((this.request.getHeader('Content-Type-None-Exists') || 'DefaultValue'));
        };
      }
      util.inherits(GetRequestHeaderDefaultValueHandler, requestHandler.RequestHandler);
      
      ferrum.Application({
        host: config.host,
        port: config.port,
        routes: {
          '^/set-header$': new SetHeaderHandler(),
          '^/get-header$': new GetHeaderHandler(),
          '^/get-header-default-value$': new GetHeaderDefaltValueHandler(),
          '^/get-request-header$': new GetRequestHeaderHandler(),
          '^/get-request-header-default-value$': new GetRequestHeaderDefaultValueHandler()
        }
      }).run();
      
      return true;
    },
    
    'Set header': {
      topic: function () {
        client.get(config.host + ':' + config.port + '/set-header', this.callback);
      },
      'should be header defined': function (err, topic, body) {
        assert.equal(topic.headers['content-type'], 'text/xml; charset=cp-1251');
      }
    },
    
    'Get header': {
      topic: function () {
        client.get(config.host + ':' + config.port + '/get-header', this.callback);
      },
      'should be header defined': function (err, topic, body) {
        assert.equal(body, 'text/xml; charset=cp-1251');
      }
    },
    
    'Get header (default value)': {
      topic: function () {
        client.get(config.host + ':' + config.port + '/get-header-default-value', this.callback);
      },
      'should be header defined': function (err, topic, body) {
        assert.equal(body, 'DefaultValue');
      }
    },
    
    'Get request header': {
      topic: function () {
        client.get(config.host + ':' + config.port + '/get-request-header', {user_agent: 'Test-Agent'}, this.callback);
      },
      'should be header defined': function (err, topic, body) {
        assert.equal(body, 'Test-Agent');
      }
    },
    
    'Get request header (default value)': {
      topic: function () {
        client.get(config.host + ':' + config.port + '/get-request-header-default-value', {user_agent: 'Test-Agent'}, this.callback);
      },
      'should be header defined': function (err, topic, body) {
        assert.equal(body, 'DefaultValue');
      }
    },

  }
}).export(module);
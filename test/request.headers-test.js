/**
 * Module dependencies
 */
var vows = require('vows');
var assert = require('assert');
var util = require('util');

var ferrum = require('../lib/index');
var requestHandler = require('../lib/request-handler');

var client = require('needle');

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
        port: process.env.PORT,
        address: process.env.IP,
        routes: {
          '^/set-header$': SetHeaderHandler,
          '^/get-header$': GetHeaderHandler,
          '^/get-header-default-value$': GetHeaderDefaltValueHandler,
          '^/get-request-header$': GetRequestHeaderHandler,
          '^/get-request-header-default-value$': GetRequestHeaderDefaultValueHandler
        }
      }).run();
      
      return true;
    },
    
    'Set header': {
      topic: function () {
        client.get(process.env.IP + ':' + process.env.PORT + '/set-header', this.callback);
      },
      'should be header defined': function (err, topic, body) {
        assert.equal(topic.headers['content-type'], 'text/xml; charset=cp-1251');
      }
    },
    
    'Get header': {
      topic: function () {
        client.get(process.env.IP + ':' + process.env.PORT + '/get-header', this.callback);
      },
      'should be header defined': function (err, topic, body) {
        assert.equal(body, 'text/xml; charset=cp-1251');
      }
    },
    
    'Get header (default value)': {
      topic: function () {
        client.get(process.env.IP + ':' + process.env.PORT + '/get-header-default-value', this.callback);
      },
      'should be header defined': function (err, topic, body) {
        assert.equal(body, 'DefaultValue');
      }
    },
    
    'Get request header': {
      topic: function () {
        client.get(process.env.IP + ':' + process.env.PORT + '/get-request-header', {user_agent: 'Test-Agent'}, this.callback);
      },
      'should be header defined': function (err, topic, body) {
        assert.equal(body, 'Test-Agent');
      }
    },
    
    'Get request header (default value)': {
      topic: function () {
        client.get(process.env.IP + ':' + process.env.PORT + '/get-request-header-default-value', {user_agent: 'Test-Agent'}, this.callback);
      },
      'should be header defined': function (err, topic, body) {
        assert.equal(body, 'DefaultValue');
      }
    },

  }
}).export(module);
/**
 * Module dependencies
 */
var vows = require('vows');
var assert = require('assert');
var util = require('util');
var client = require('needle');
var http = require('http');

var config = require('./config');
var ferrum = require('../lib/index');
var requestHandler = require('../lib/request-handler');

function responds(status) {
  return {
    with: function (data, options) {
      var context = {
        topic: function () {
          var path = config.host + ":" + config.port + this.context.name.split(/ +/)[1];
          console.log(path);
          if (data) {
            client.post(path, data, options, this.callback);
          } else {
            client.get(path, this.callback);
          }
        }
      };
      
      context['should respond with a ' + status + ' ' + http.STATUS_CODES[status]] = function (err, response) {
        assert.equal(response.statusCode, status);
      };    
      context['should respond with default headers'] = function (err, response) {
        assert.equal(response.headers.server, 'Ferrum 0.1a');
        assert.equal(response.headers['content-type'], 'text/html; charset=UTF-8');
      };    
      context['should not set cookies'] = function (err, response) {
        assert.isUndefined(response.headers['set-cookie']);       
      };
      
      return context;
    }
  };
}

// Ferrum :: Request Handler Test Suite
vows.describe('Ferrum/Request Handler').addBatch({
  'Module': {
    topic: requestHandler,
    
    'should be module defined correctly': function (requestHandler) {
      assert.isFunction(requestHandler.RequestHandler);
      assert.isFunction(requestHandler.StaticRequestHandler);
      // TODO: To be tested in separate test suite
      //assert.instanceOf(new topic.StaticRequestHandler(), requestHandler.RequestHandler);
    }
  },
  
  'Instance': {
    topic: new requestHandler.RequestHandler(),
    
    'should be methods defined correctly': function (requestHandler) {
      assert.isFunction(requestHandler.handle);
      assert.isFunction(requestHandler.write);
      assert.isFunction(requestHandler.render);
      assert.isObject(requestHandler.header);
      assert.isFunction(requestHandler.header.setDefault);
      assert.isFunction(requestHandler.header.set);
      assert.isFunction(requestHandler.header.get);
      assert.isFunction(requestHandler.header.clear);
    }
  },
  
  'No method handlers': {
    topic: function () {
      
      // Empty/default handler
      function MainHandler () {
        requestHandler.RequestHandler.call(this);
      }
      util.inherits(MainHandler, requestHandler.RequestHandler);
      
      // Request handler with defined method handlers
      function DefinedMethodHandler () {
        requestHandler.RequestHandler.call(this);
        
        this.get = function () {
          this.response.end();
        };
        
        this.post = function () {
          this.response.end();
        };
        
        this.del = function () {
          this.response.end();
        };
        
        this.patch = function () {
          this.response.end();
        };
        
        this.put = function () {
          this.response.end();
        };
        
        this.options = function () {
          this.response.end();
        };
        
        this.head = function () {
          this.response.end();
        };
      }
      util.inherits(DefinedMethodHandler, requestHandler.RequestHandler);
      
      ferrum.Application({
        host: config.host,
        port: config.port,
        routes: { '^/$': MainHandler, '^/ok$': DefinedMethodHandler }
      }).run();
      
      return true;
    },
    
    'HEAD /': responds(405).with(),    
    'GET /': responds(405).with(),
    'POST / (form-data)': responds(405).with({}),
    'POST / (urldecoded)': responds(405).with({foo: 'bar', image: { file: '', content_type: '' }}, {multipart: true}),
    'POST / (form-data [with data])': responds(405).with({key: 'value'}),
    'POST / (urldecoded [with data])': responds(405).with({key: 'value'}, {multipart: true}),
    'POST / (form-data [with file])': responds(405).with({key: {type: 'file', filename: 'fixtures/file-to-upload.txt'}}),
    'DELETE /': responds(405).with(),    
    'PATCH /': responds(405).with(),
    'PUT /': responds(405).with(),
    'OPTIONS /': responds(405).with(),
    
    'HEAD /ok': responds(200).with(),    
    'GET /ok': responds(200).with(),
    'POST /ok (form-data)': responds(200).with({}),
    'POST /ok (urldecoded)': responds(200).with({foo: 'bar', image: { file: '', content_type: '' }}, {multipart: true}),
    'POST /ok (form-data [with data])': responds(200).with({key: 'value'}),
    'POST /ok (urldecoded [with data])': responds(200).with({key: 'value'}, {multipart: true}),
    'POST /ok (form-data [with file])': responds(200).with({key: {type: 'file', filename: 'fixtures/file-to-upload.txt'}}),
    'DELETE /ok': responds(200).with(),    
    'PATCH /ok': responds(200).with(),
    'PUT /ok': responds(200).with(),
    'OPTIONS /ok': responds(200).with()
  }  
}).export(module);
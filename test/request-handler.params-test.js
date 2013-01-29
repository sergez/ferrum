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

//var os = require('os');

// ferrum :: Request Test Suite
vows.describe('ferrum/Request Handler/Query Params').addBatch({
  '': {
    topic: function () {
      // default handler
      function ParamsHandler () {
        requestHandler.RequestHandler.call(this);
        
        this.get = function () {
          this.write(JSON.stringify(this.request.query));
        };
        
        this.post = function () {
          this.write(JSON.stringify(this.request.query));
        };
      }
      util.inherits(ParamsHandler, requestHandler.RequestHandler);
      
      function FilesHandler () {
        requestHandler.RequestHandler.call(this);
        
        this.post = function () {
          this.write(JSON.stringify(this.request.files));
        };
      }
      util.inherits(FilesHandler, requestHandler.RequestHandler);      
      
      ferrum.Application({
        host: config.host,
        port: config.port,
        routes: {
          '^/params$': ParamsHandler,
          '^/files$': FilesHandler,
        }
      }).run();
      
      return true;
    },
    
    'GET (params1=value1&params2=value2)': {
      topic: function () {
        client.get(config.host + ':' + config.port + '/params?params1=value1&params2=value2', this.callback);
      },
      'should respond 200 OK': function (err, topic, body) {
        assert.equal(topic.statusCode, '200');
      },
      'should be': function (err, topic, body) {
        assert.equal(body, '{"params1":"value1","params2":"value2"}');
      }
    },
    
    'GET (params1=value1&params1=value2)': {
      topic: function () {
        client.get(config.host + ':' + config.port + '/params?params1=value1&params1=value2', this.callback);
      },
      'should respond 200 OK': function (err, topic, body) {
        assert.equal(topic.statusCode, '200');
      },
      'should be': function (err, topic, body) {
        assert.equal(body, '{"params1":["value1","value2"]}');
      }
    },
    
    'GET (params[]=value1&params[]=value2)': {
      topic: function () {
        client.get(config.host + ':' + config.port + '/params?params[]=value1&params[]=value2', this.callback);
      },
      'should respond 200 OK': function (err, topic, body) {
        assert.equal(topic.statusCode, '200');
      },
      'should be': function (err, topic, body) {
        assert.equal(body, '{"params":["value1","value2"]}');
      }
    },
    
    'POST': {
      topic: function () {
        client.post(config.host + ':' + config.port + '/params', {params: ["value1", "value2"]}, this.callback);
      },
      
      'should respond 200 OK': function (err, topic, body) {
        assert.equal(topic.statusCode, '200');
        assert.equal(body, '{"params":["value1","value2"]}');
      },
    },
    
    /*'POST (file)': {
      topic: function () {
        var data = {
          "image": { file: './test/test.txt', content_type: 'text/html' },
        };
        
        client.post(process.env.IP + ':' + process.env.PORT + '/files', data, {multipart: true}, this.callback);
      },
      
      'should respond 200 OK': function (err, topic, body) {
        assert.equal(topic.statusCode, '200');
        //assert.equal(body, '');
      },
    }*/

  }
}).export(module);
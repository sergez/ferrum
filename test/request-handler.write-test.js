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

// Ferrum :: Request Handler :: Write Test Suite
vows.describe('Ferrum/Request Handler').addBatch({
  'Write': {
    topic: function () {
      // TODO: Need to test write with other params. e.g. Boolean type, Object, etc...
      function WriteHandler () {
        requestHandler.RequestHandler.call(this);
        
        this.get = function () {
          this.write("Welcome");
        };
      }
      util.inherits(WriteHandler, requestHandler.RequestHandler);
      
      ferrum.Application({
        host: config.host,
        port: config.port,
        routes: { '^/write-test$': new WriteHandler() }
      }).run();
      
      return true;
    },
    'GET /write-test': {
      topic: function () {
        client.get(config.host + ":" + config.port + "/write-test", this.callback);
      },
      
      'should respond with a 200 OK': function (err, response) {
        assert.equal(response.statusCode, 200);
      },
      'should respond with default headers': function (err, response) {
        assert.equal(response.headers.server, 'Ferrum 0.1a');
        assert.equal(response.headers['content-type'], 'text/html; charset=UTF-8');
      },   
      'should not set cookies': function (err, response) {
        assert.isUndefined(response.headers['set-cookie']);       
      },
      'should write output correct': function (err, response, body) {
        assert.equal(body, 'Welcome');
      }
    },
  }
}).export(module);
/**
 * Module dependencies
 */
var vows = require('vows');
var assert = require('assert');
//var util = require('util');
var client = require('needle');

var config = require('./config');
var ferrum = require('../lib/index');
//var requestHandler = require('../lib/request-handler');
var TEST_HOST = config.host + ':' + config.port;

// Ferrum :: Request Test Suite
vows.describe('Ferrum/Request Handler/Statics').addBatch({
  'Request Handler': {
    topic: function () {
      
      ferrum.Application({
        host: config.host,
        port: config.port,
        static: {
          path: './test/fixtures/'
        }
      }).run();
      
      return true;
    },
    
    'GET /static-file.txt': {
      topic: function () {
        client.get(TEST_HOST + '/static/static-file.txt', this.callback);
      },
      'should be body defined': function (err, response, body) {
        assert.equal(response.statusCode, 200);
        assert.isNotNull(response.headers['etag']);
        assert.isNotNull(response.headers['date']);
        assert.isNotNull(response.headers['last-modified']);
        assert.equal(body, 'static file');
      }
    },
    
    'HEAD /static-file.txt': {
      topic: function () {
        client.head(TEST_HOST + '/static/static-file.txt', this.callback);
      },
      'should be body defined': function (err, response, body) {
        assert.equal(response.statusCode, 200);
        assert.isNotNull(response.headers['etag']);
        assert.isNotNull(response.headers['date']);
        assert.isNotNull(response.headers['last-modified']);
        assert.equal(body, '');
      }
    },
    
    'GET /not-found': {
      topic: function () {
        client.get(TEST_HOST + '/static/not-found', this.callback);
      },
      'should response with 404': function (err, response, body) {
        assert.equal(response.statusCode, 404);
        assert.isNotNull(response.headers['etag']);
        assert.isNotNull(response.headers['date']);
        assert.isNotNull(response.headers['last-modified']);
        assert.equal(body, '');
      }
    },
    
    'GET /static-file.txt (If-None-Match)': {
      topic: function () {
        var self = this;
        client.get(TEST_HOST + '/static/static-file.txt', function (error, response, body) {
          var options = {
            headers:{
              "if-none-match": response.headers['etag']
            }
          };
          client.get(TEST_HOST + '/static/static-file.txt', options, self.callback);
        });
      },
      'should respond with 304': function (err, response, body) {
        assert.equal(response.statusCode, 304);
        assert.isNotNull(response.headers['etag']);
        assert.isNotNull(response.headers['date']);
        assert.isNotNull(response.headers['last-modified']);
        assert.equal(body, '');
      }
    },
    
    'GET /static-file.txt (If-Modified-Since)': {
      topic : function() {
        var self = this;
        
        client.get(TEST_HOST + '/static/static-file.txt', function(error, response, body) {
          var modified = Date.parse(response.headers['last-modified']);
          var oneDayLater = new Date(modified + (24 * 60 * 60 * 1000)).toUTCString();
          var options = {
            headers: {
              'if-modified-since': oneDayLater
            }
          };
          client.get(TEST_HOST + '/static/static-file.txt', options, self.callback);
      });
    },
    'should respond with a 200': function(error, response, body){
      assert.equal(response.statusCode, 304);
      assert.isNotNull(response.headers['etag']);
      assert.isNotNull(response.headers['date']);
      assert.isNotNull(response.headers['last-modified']);
      assert.equal(body, '');
    }
  },
  'GET /static-file.txt (If-None-Match and If-Modified-Since)': {
      topic : function() {
        var self = this;
        
        client.get(TEST_HOST + '/static/static-file.txt', function(error, response, body) {
          var modified = Date.parse(response.headers['last-modified']);
          var oneDayLater = new Date(modified + (24 * 60 * 60 * 1000)).toUTCString();
          var options = {
            headers: {
              'if-modified-since': oneDayLater,
              "if-none-match": "-incorrect-etag-"
            }
          };
          client.get(TEST_HOST + '/static/static-file.txt', options, self.callback);
      });
    },
    'should respond with a 200': function(error, response, body){
      assert.equal(response.statusCode, 200);
      assert.isNotNull(response.headers['etag']);
      assert.isNotNull(response.headers['date']);
      assert.isNotNull(response.headers['last-modified']);
      assert.equal(body, 'static file');
    }
  }
  /* mime type and server headers */
  }
}).export(module);
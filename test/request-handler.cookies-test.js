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

// Ferrum :: Request Test Suite
vows.describe('ferrum/Request Handler/Cookies').addBatch({
  'Request Handler': {
    topic: function () {
      // default handler
      function CookieHandler () {
        requestHandler.RequestHandler.call(this);
        
        this.get = function () {
          this.cookies.set('testCookie', 'value');
          this.response.end();
        };
      }
      util.inherits(CookieHandler, requestHandler.RequestHandler);
      
      ferrum.Application({
        host: config.host,
        port: config.port,
        routes: {
          '^/cookie$': new CookieHandler()
        }
      }).run();
      
      return true;
    },
    
    'Set cookies': {
      topic: function () {
        client.get(config.host + ':' + config.port + '/cookie', this.callback);
      },
      'should be set-cookie header defined': function (err, response, body) {
        assert.equal(/testCookie=value/.test(response.headers['set-cookie'][0]), true);
      }
    }

  }
}).export(module);
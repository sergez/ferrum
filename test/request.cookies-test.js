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
        port: process.env.PORT,
        address: process.env.IP,
        routes: {
          '^/cookie$': CookieHandler
        }
      }).run();
      
      return true;
    },
    
    'Set cookies': {
      topic: function () {
        client.get(process.env.IP + ':' + process.env.PORT + '/cookie', this.callback);
      },
      'should be set-cookie header defined': function (err, response, body) {
        assert.equal(/testCookie=value/.test(response.headers['set-cookie'][0]), true);
      }
    }

  }
}).export(module);
/**
 * Module dependencies
 */
var vows = require('vows');
var assert = require('assert');
var util = require('util');

var ferrum = require('../lib/index');
var requestHandler = require('../lib/request-handler');

var client = require('needle');

// Ferrum :: Request Test Suite
vows.describe('Ferrum/Request Handler/Render templates').addBatch({
  'Request Handler': {
    topic: function () {
      // default handler
      function TemplateHandler () {
        requestHandler.RequestHandler.call(this);
        
        this.get = function () {
          this.render('index.html', {var: "value"});
        };
      }
      util.inherits(TemplateHandler, requestHandler.RequestHandler);
      
      ferrum.Application({
        /*port: process.env.PORT,
        address: process.env.IP,*/
        views: './test/tpl/',
        routes: {
          '^/template': TemplateHandler
        }
      }).run();
      
      return true;
    },
    
    'Render template': {
      topic: function () {
        client.get('127.0.0.1:8888/template', this.callback);
      },
      'should be set-cookie header defined': function (err, response, body) {
        assert.equal(body, '<html><body>value</body></html>');
      }
    }
    
    // Template inherits

  }
}).export(module);
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

// Ferrum :: Request Handler :: Render Test Suite
vows.describe('Ferrum/Request Handler/Render').addBatch({
  'Render': {
    topic: function () {
      // default handler
      function TemplateHandler () {
        requestHandler.RequestHandler.call(this);
        
        this.get = function () {
          this.render('index', {var: "value"});
        };
      }
      util.inherits(TemplateHandler, requestHandler.RequestHandler);
      
      ferrum.Application({
        host: config.host,
        port: config.port,
        viewsPath: './test/fixtures/',
        routes: {
          '^/template': new TemplateHandler()
        }
      }).run();
      
      return true;
    },
    
    'Render template': {
      topic: function () {
        client.get(config.host + ':' + config.port + '/template', this.callback);
      },
      'should be body defined correctly': function (err, response, body) {
        assert.equal(body, '<html><body>value</body></html>');
      }
    }
    
    // Template inherits
    // Template helpers
  }
}).export(module);
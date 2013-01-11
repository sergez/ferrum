/**
 * Module dependencies
 */
var vows = require('vows');
var assert = require('assert');
var util = require('util');

var ferrum = require('../lib/index');
var requestHandler = require('../lib/request-handler');

var client = require('./helpers/client').client;
var http = require('http');

var assertHelpers = require('./helpers/assert').helpers;

function respondsWith(status, data, type) {
    var context = {
        topic: function () {
            // Get the current context's name, such as 'POST /'
            // and split it at the space.
            var req    = this.context.name.split(/ +/), // ['POST', '/']
                method = req[0].toLowerCase(),          // 'post'
                path   = req[1];                        // '/'

            // Perform the contextual client request,
            // with the above method and path.
            if (data) {
                client[method](path, data, type, this.callback);
            } else {
                client[method](path, this.callback);
            }
        }
    };
    // Create and assign the vow to the context.
    // The description is generated from the expected status code
    // and status name, from node's http module.
    context['should respond with a ' + status + ' ' + http.STATUS_CODES[status]] = assertHelpers.assertStatus(status);    
    context['should respond with default headers'] = assertHelpers.assertDefaultHeaders();    
    context['should not set cookies'] = assertHelpers.assertNotSetCookie();

    return context;
}

vows.describe('ferrum/Request Handler/Handlers').addBatch({
  'Request Handler': {
    topic: function () {
      // default handler
      function MainHandler () {
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
      util.inherits(MainHandler, requestHandler.RequestHandler);
      
      ferrum.Application({
        port: process.env.PORT,
        address: process.env.IP,
        routes: { '^/$': MainHandler }
      }).run();
      
      return true;
    },
    
    'HEAD /': respondsWith(200),    
    'GET /': respondsWith(200),
    'POST / (form-data)': respondsWith(200, {}, 'form-data'),
    'POST / (urldecoded)': respondsWith(200, {}, 'urldecoded'),
    'POST / (form-data [with data])': respondsWith(200, {key: 'value'}, 'form-data'),
    'POST / (urldecoded [with data])': respondsWith(200, {key: 'value'}, 'urldecoded'),
    'POST / (form-data [with file])': respondsWith(200, {key: {type: 'file', filename: 'test.txt'}}),
    'DELETE /': respondsWith(200),    
    'PATCH /': respondsWith(200),
    'PUT /': respondsWith(200),
    'OPTIONS /': respondsWith(200)
  }
}).export(module);
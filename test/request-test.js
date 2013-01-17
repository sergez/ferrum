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

// ferrum :: Request Test Suite
vows.describe('ferrum/Request Handler').addBatch({
  'Request': {
    topic: requestHandler,
    
    'should be methods defined correctly': function (topic) {
      assert.isFunction(topic.RequestHandler);
      assert.isFunction((new topic.RequestHandler()).handle);
      assert.isFunction(topic.StaticRequestHandler);
      assert.instanceOf(new topic.StaticRequestHandler(), requestHandler.RequestHandler);
      // TODO: assert.isFunction(topic.RequestListener);
    }
  },
  
  'Request Handler :: Default behaviour': {
    topic: function () {
      // default handler
      function MainHandler () {
        requestHandler.RequestHandler.call(this);
      }
      util.inherits(MainHandler, requestHandler.RequestHandler);
      
      // TODO: Need to test write with other params. e.g. Boolean type, Object, etc...
      function WriteHandler () {
        requestHandler.RequestHandler.call(this);
        
        this.get = function () {
          this.write("Welcome");
        };
      }
      util.inherits(WriteHandler, requestHandler.RequestHandler);
      
      ferrum.Application({
        routes: { '^/$': MainHandler, '^/write-test$': WriteHandler }
      }).run();
      
      return true;
    },
    
    'HEAD /': respondsWith(405),    
    'GET /': respondsWith(405),
    'GET / (write)': {
      topic: function () {
        client.get("/write-test", this.callback);
      },
      
      'should write output correct': function (topic) {
        var chunk = '';
        
        topic.on('data', function (data) {
          chunk = chunk + data;
          assert.equal(chunk, 'Welcome');
        });
      }
    },
    'POST / (form-data)': respondsWith(405, {}, 'form-data'),
    'POST / (urldecoded)': respondsWith(405, {}, 'urldecoded'),
    'POST / (form-data [with data])': respondsWith(405, {key: 'value'}, 'form-data'),
    'POST / (urldecoded [with data])': respondsWith(405, {key: 'value'}, 'urldecoded'),
    'POST / (form-data [with file])': respondsWith(405, {key: {type: 'file', filename: 'test.txt'}}),
    'DELETE /': respondsWith(405),    
    'PATCH /': respondsWith(405),
    'PUT /': respondsWith(405),
    'OPTIONS /': respondsWith(405)
  }
  
}).export(module);
/**
 * Module dependencies
 */
var vows = require('vows');
var assert = require('assert');
var events = require('events');
var Request = require('../lib/request').Request;

// Ferrum :: Request Test Suite
vows.describe('Ferrum/Request').addBatch({
  'Request': {
    topic: Request({method: "GET", headers: {"test-header": "value"}}, {}),
    
    'should be methods defined correctly': function (Request) {
      assert.isObject(Request);
      assert.equal((Request instanceof events.EventEmitter), true);
      assert.isFunction(Request.getHeader);
      assert.isFunction(Request.start);
      assert.isFunction(Request._parseQueryParams);
    },
    
    'should be header value returns correctly': function (Request) {
      assert.equal(Request.getHeader('test-header'), 'value');
      assert.equal(Request.getHeader('test-header-non-exists'), undefined);
    }
  }
}).export(module);
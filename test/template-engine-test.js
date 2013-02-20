/**
 * Module dependencies
 */
var vows = require('vows');
var assert = require('assert');
var events = require('events');
var path = require('path');
var TemplateEngine = require('../lib/template-engine').TemplateEngine;

// Ferrum :: Template Engine Test Suite
vows.describe('Ferrum/Template Engine').addBatch({
  'Template Engine Instance': {
    topic: new TemplateEngine({
      viewsDir: './test/fixtures/'
    }),
    
    'should be methods defined correctly': function (engine) {
      assert.isObject(engine);
      //assert.instanceOf(engine, events.EventEmmiter);
      assert.isFunction(engine.compile);
      assert.isFunction(engine.render);
      assert.isFunction(engine.load);
      assert.isFunction(engine.resolvePath);
    },
    
    'should compile source': {
      topic: function (engine) {
        this.callback(null, engine.compile('source to be compiled'));
      },
      '-': function (compiledSource) {
        assert.equal(compiledSource, 'source to be compiled');
      }
    },
    
    'should load source of template': {
      topic: function (engine) {
        engine.load('index.html', this.callback);
      },
      'error should be null and source should be defined': function (error, source) {
        assert.isNull(error);
        assert.equal(source, '<html><body>{var}</body></html>');
      }
    },
    
    'when template/view not exists': {
      topic: function (engine) {
        engine.load('not-exists.html', this.callback);
      },
      'error should be defined and source should be null': function (error, source) {
        assert.isObject(error);
        assert.isUndefined(source);
      }
    },
    
    'should resolve path': {
      topic: function (engine) {
        engine.resolvePath('index.html', this.callback);
      }, 
      'error should be null and path sould be resolved correctly': function (error, tplPath) {
        assert.isNull(error);
        assert.equal(tplPath, path.join(process.cwd(), 'test/fixtures/index.html'));
      }
    }
  }
}).export(module);
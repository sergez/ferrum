/**
 * Provides the base TemplateEngine class
 * 
 * @module request
 */
var fs = require('fs');
var path = require('path');
var events = require('events');
var util = require('util');

/**
 * Provides ...
 *        
 *        var util = require('util');
 *        var dust = require('dustjs-linkedin');
 *        var TemplateEngine = require('../template-engine').TemplateEngine;
 * 
 *        function DustEngine (options) {
 *          var self = this;
 *          TemplateEngine.call(this, options);
 * 
 *          dust.onLoad = function(tplName, callback) {
 *            self.load(tplName + ".html", callback);
 *          };
 *        }
 *        util.inherits(DustEngine, TemplateEngine);
 * 
 *        DustEngine.prototype.render = function(tplName, context) {
 *          var self = this;
 *          dust.render(tplName, context, function onRender (error, output) {
 *            self.emit('render', output);
 *          });
 *        };
 * 
 *        module.exports.DustEngine = DustEngine;
 *
 * @class TemplateEngine
 * @constructor
 * @param {Object} options Template engine options
 *  @param {String} [options.viewDir] A directory where templates/views is located. `./views/` by default
 *  @param {String} [options.viewsEncoding] Charset of templates/views. `utf8` by default
 */
function TemplateEngine (options) {
  events.EventEmitter.call(this);
  
  this.cache = [];
  
  options             = options || {};
  this.viewsDir       = options.viewsDir || './views/';
  this.viewsEncoding  = options.viewsEncoding || 'utf8';
}

util.inherits(TemplateEngine, events.EventEmitter);

/**
* Compiles source of template/view returned by load method.
* It's just empty method to be defined necessarily in child constructor.
*
* @method compile
* @param {String} source Source of template/view
* @param {String} tplName Template/view name
* @for TemplateEngine
*/
TemplateEngine.prototype.compile = function (source, tplName) {
  return source;
};

/**
* Loads templates/views from a file system
*
* @method load
* @param {String} tplName Name of template/view
* @param {Function} callback The callback is passed two arguments (`error`, `source`), where `source` is the contents of the template/view.
* @for TemplateEngine
*/
TemplateEngine.prototype.load = function (tplName, callback) {
  var self = this;
  this.resolvePath(tplName, function onResolvePath (error, resolvePath) {
    if (error) {
      process.nextTick(function () {
        callback(error);
      });
    } else {
      fs.readFile(resolvePath, self.viewsEncoding, callback);
    }
  });
};

/**
* Resolves path of templates/views
*
* @method resolvePath
* @param {String} tplName Name of template/view
* @param {Function} callback The callback is passed two arguments (`error`, `resolvePath`), where `resolvePath` is the fullpath to the template/view.
* @for TemplateEngine
*/
TemplateEngine.prototype.resolvePath = function (tplName, callback) {
  fs.realpath(this.viewsDir, function onRealPath (error, resolvedPath) {
    process.nextTick(function () {
      callback(error, path.join(resolvedPath, tplName));
    });
  });
};

/**
* Renders templates/views in context `context`
*
* @method render
* @param {String} tplName Name of template/view
* @param {Object} context 
* @for TemplateEngine
*/
TemplateEngine.prototype.render = function (tplName, context) {
  var self = this;
  this.tplName = tplName;
  
  var tpl = this.cache[tplName];
  
  if (!tpl) {
    this.load(tplName, function onLoad (error, source) {
      if (error) {
        self.emit('error', error);
        return;
      }
      tpl = self.compile(source, tplName);
      self.cache[tplName] = tpl;
      self.emit('render', tpl(context));
    });
  } else {
    this.emit('render', tpl(context));
  }
};

module.exports.TemplateEngine = TemplateEngine;
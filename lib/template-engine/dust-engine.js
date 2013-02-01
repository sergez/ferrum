/**
 * Provides the base TemplateEngine class
 * 
 * @module request
 */
var util = require('util');
var dust = require('dustjs-linkedin');
var TemplateEngine = require('../template-engine').TemplateEngine;

/**
 * Creates ...
 * 
 * @class TemplateEngine
 */
function DustEngine (options) {
  var self = this;
  TemplateEngine.call(this, options);
  
  dust.onLoad = function(tplName, callback) {
    self.load(tplName + ".html", callback);
  };
}

util.inherits(DustEngine, TemplateEngine);

DustEngine.prototype.render = function(tplName, context) {
  var self = this;
  dust.render(tplName, context, function onRender (error, output) {
    self.emit('render', output);
  });
};

module.exports.DustEngine = DustEngine;
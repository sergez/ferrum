#!/usr/bin/env node


"#!upstart"
"description \"node.js server\""
"author      \"joe\""
""
"start on startup"
"stop on shutdown"
""
"script"
"    export HOME=\"/root\""

"    echo $$ > /var/run/yourprogram.pid"
"    exec sudo -u username /usr/local/bin/node /where/yourprogram.js >> /var/log/yourprogram.sys.log 2>&1"
"end script"
""
"pre-start script"
"    # Date format same as (new Date()).toISOString() for consistency"
"    echo \"[`date -u +%Y-%m-%dT%T.%3NZ`] (sys) Starting\" >> /var/log/yourprogram.sys.log"
"end script"
""
"pre-stop script"
"    rm /var/run/yourprogram.pid"
"    echo \"[`date -u +%Y-%m-%dT%T.%3NZ`] (sys) Stopping\" >> /var/log/yourprogram.sys.log"
"end script"

var fs = require('fs');
var path = require("path");
var optimist = require('optimist');
var cwd = process.cwd();

optimist
  .usage([
    'USAGE: $0 [<options>]',
    'simple, rfc 2616 compliant file streaming module for node'].join('\n\n'))
  
  .option('help', {
    alias: 'h',
    description: 'display this help message'
  });
  
var argv = optimist.argv;

if (argv._[0] == 'create' && argv._[1]) {
  
  var applicationDir = path.join(cwd, argv._[1]);
  
  var mainHandler = [
    "var util = require('util');",
    "var RequestHandler = require('ferrum').RequestHandler;",
    "",
    "function MainHandler () {",
    "  RequestHandler.call(this);",
    "  this.get = function () {",
    "    this.write('It works!');",
    "  };",
    "}",
    "",
    "util.inherits(MainHandler, RequestHandler);",
    "",
    "module.exports = new MainHandler();"];
    
  var config = [
    "var MainHandler = require('./handlers/MainHandler');",
    "",
    "module.exports = {",
    " routes: {",
    "   \"^/$\": MainHandler ",
    " }",
    "};"];
    
  var index = [
    "var ferrum = require('ferrum');",
    "var config = require('./config');",
    "",
    "ferrum.Application(config).run();"];
  
  // package.json
  var pkg = {
    name: argv._[1],
    version: '0.0.1',
    private: true,
    scripts: {
      start: 'node app'
    },
    dependencies: {
      ferrum: '0.0.3a'
    }
  };
  
  fs.exists(applicationDir, existsCb);
  
  function existsCb (exists) {
    
    if (exists) {
      createPackageJSON();
    } else {
      console.log('mk dir');
      fs.mkdir(argv._[1], createPackageJSON);
    }
  }
  
  function createPackageJSON (){
    fs.writeFile(path.join(applicationDir, 'package.json'), JSON.stringify(pkg, null, 2), function () {
      //process.exit(0);
    });
  }
  
  // create handlers dir
  fs.mkdir(path.join(applicationDir, 'handlers'), function () {
    fs.writeFile(path.join(applicationDir, 'handlers/MainHandler.js'), mainHandler.join("\n"));
  });
  
  fs.writeFile(path.join(applicationDir, 'config.js'), config.join("\n"));
  fs.writeFile(path.join(applicationDir, 'index.js'), index.join("\n"));
} else {
  optimist.showHelp(console.log);
  process.exit(0);
}
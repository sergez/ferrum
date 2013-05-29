/**
 * Provides the base RequestListener class
 * 
 * @module request-listener
 */
var util = require('util');
var url = require('url');

/**
 * Creates ...
 * 
 * @class RequestListener
 * @constructor
 * @param {Object} application Application instance
 * @return {Function}
 */ 
function RequestListener (application) {
  if (!(this instanceof RequestListener)) {
    return new RequestListener(application);
  }
  
  return function dispatch (request, response) {
    var pathname = url.parse(request.url).pathname;
    var routeFound = false;
    var route;
    
    for (route in application.routes) {
      var requestHandler = application.routes[route];
      var matches = pathname.match(route);
      
      if (matches) {
        (new requestHandler()).handle({
          request: request,
          response: response,
          application: application,
          extraParams: matches.slice(1)
        });
        
        routeFound = true;
        break;
      }
    }
    
    if (!routeFound) {
      application.logger.warn(util.format('Route "%s" not found', pathname));
      response.statusCode = 404;
      response.end();
    }
  };
}

module.exports.RequestListener = RequestListener;
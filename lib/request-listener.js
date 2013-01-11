var util = require('util');
var url = require('url');

var _ = require('lodash');

/**
 * 
 */
function RequestListener (application) {
  if (!(this instanceof RequestListener)) {
    return new RequestListener(application);
  }
  
  return function dispatch (request, response) {
    var pathname = url.parse(request.url).pathname;
    var routeFound = false;
    
    _.forEach(application.options.routes, function requestListenerIterator (RequestHandler, route) {
      var matches = pathname.match(route);
      
      if (matches) {
        (new RequestHandler()).handle({
          request: request,
          response: response,
          application: application,
          extraParams: _.rest(matches)
        });
        
        routeFound = true;
        return false;
      }
    });
    
    if (!routeFound) {
      application.logger.warn(util.format('Route "%s" not found', pathname));
      response.statusCode = 404;
      response.end();
    }
  };
}

module.exports.RequestListener = RequestListener;
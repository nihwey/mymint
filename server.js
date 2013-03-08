var http = require('http');
var url = require('url');
var host = process.env.IP || '127.0.0.1';
var port = process.env.PORT || 1337;

var fs = require('fs');
var handlers = require('./handlers');

/**
 * Starts the server.
 */
function start(handle) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    route(handle, pathname, response, request);
  }
  http.createServer(onRequest).listen(port, host);
  console.log('Server running at http://' + host + ':' + port + '/');
}

/**
 * Routes a pathname to its corresponding handler, or attempts to render it as
 * a resource.
 */
function route(handle, pathname, response, request) {
  if (typeof handle[pathname] === 'function') {
    handle[pathname](response, request);
  } else {
    var resource = pathname.substring(1, pathname.length);
    fs.exists(resource, function(exists) {
      if (exists) {
        handlers.render(resource, response);
      } else {
        console.log('No resource ' + resource + '.');
        handlers.write404(pathname, response);
      }
    });
  }
}

exports.start = start;

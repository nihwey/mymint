var server = require('./server');
var handlers = require('./handlers');

var handles = {
  '/': handlers.main,
  '/getStatementList': handlers.getStatementList
};

server.start(handles);

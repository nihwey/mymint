var server = require('./server');
var handlers = require('./handlers');

var handles = {
  '/': handlers.main,
  '/getSpendingCategories': handlers.getSpendingCategories,
  '/getStatementList': handlers.getStatementList
};

server.start(handles);

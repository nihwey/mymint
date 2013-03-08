var querystring = require('querystring');
var fs = require('fs');
var path = require('path');

/**
 * A mapping of extensions to mimetypes that this application cares about.
 */
var MIMETYPE = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'img/png'
}

/**
 * Utility methods for writing various types of responses.
 */
function write(response, mimeType, contents) {
  response.writeHead(200, {'Content-Type': mimeType});
  response.write(contents);
  response.end();
}

function write404(pathname, response) {
  console.log('No request handler found for ' + pathname);
  response.writeHead(404, {'Content-Type': 'text/html'});
  response.write('404 Not found');
  response.end();
}

function write500(response, error) {
  response.writeHead(500, {'Content-Type': 'text/plain'});
  response.write(error + '\n');
  response.end();
}

/**
 * Utility method for rendering a page.
 */
function render(pathname, response) {
  function doRender(err, file) {
    if (err) {
      write500(response, err);
    } else {
      var extension = path.extname(pathname);
      var mimeType = extension in MIMETYPE ? MIMETYPE[extension] : 'text/plain';
      write(response, mimeType, file);
    }
  }
  fs.readFile(pathname, doRender);
}

/**
 * Handler for the main page.
 */
function main(response) {
  render('index.html', response);
}

/**
 * Return a statement object containing information about a single bank
 * statement.
 */
function getStatementObj(filename) {
  // Fill basic statement information.
  var name = path.basename(filename, '.txt');
  var split = name.split('_');
  var bank = split[0];
  var month = split[1];
  var day = split[2];
  var year = split[3];
  var displayDate = month + ' ' + year;
  
  var statement = {
    filename: filename,
    name: name,
    bank: bank,
    month: month,
    day: day,
    year: year,
    displayDate: displayDate
  };

  // Fill statement data.
  return parseStatement(statement);
}

/**
 * Parse a bank statement.
 */
function parseStatement(statement) {
  var contents = fs.readFileSync(path.join('static/statements/',
                                           statement.filename), 'utf8');
  var data;
  switch (statement.bank) {
    case 'boa':
      data = parseBoaStatement(contents);
      break;
    case 'chase':
      data = parseChaseStatement(contents);
      break;
    default:
      data = {};
  }
  statement.data = data;
  return statement;
}

function startsWith(word, phrase) {
  return word.indexOf(phrase) == 0;
}

/**
 * Parse a Bank of America statement.
 */
function parseBoaStatement(contents) {
  var data = { entries: [] };
  var lines = contents.split('\r\n');

  var isEntry = false;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    // If we have entered the section where there are just monetary entries,
    // save the data.
    if (isEntry) {
      line = line.split('"');
      if (line[0] != '') {
        data.entries.push({
          date: line[0].substring(0, line[0].length-1),  // strip out the ','
          description: line[1],
          amount: line[3],
          balance: line[5]
        });
      }

    } else {
      // Otherwise, do something different depending on how the line starts.
      line = line.replace(/\"/g, '').replace(',,', ',').split(',');
      switch (line[0]) {
        case 'Total credits':
          data.totalCredits = line[1];
          break;
        case 'Total debits':
          data.totalDebits = line[1];
          break;
        default:
          if (startsWith(line[0], 'Beginning balance')) {
            data.beginningBalance = line[1];
          }
          else if (startsWith(line[0], 'Ending balance')) {
            data.endingBalance = line[1];
          }
          else if (startsWith(line[0], 'Date')) {
            isEntry = true;
          }
      }
    }
  }
  return data;
}

/**
 * Parse a Chase statement.
 */
function parseChaseStatement(contents) {
  var data = { entries: [] };
  var lines = contents.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var break1 = line.indexOf(' ');
    var break2 = line.lastIndexOf(' ');
    data.entries.push({
      date: line.substring(0, break1),
      description: line.substring(break1 + 1, break2),
      amount: line.substring(break2 + 1, line.length)
    });
  }
  return data;
}

/**
 * Return a JSON list of statement data in the response of the form:
 * statements {
 *   '01 2013': [{statementObj1}, {statementObj2}, ...],
 *   '02 2013': [{statementObj1}, {statementObj2}, ...],
 *   ...
 * }
 */
function getStatementList(response, request) {
  var statements = {};
  fs.readdir('static/statements', function(err, files) {
      for (var i = 0; i < files.length; i++) {
        var f = files[i];
        if (f.indexOf('.') != 0) {
          var stmt = getStatementObj(f);
          var displayDate = stmt.displayDate;
          if (!(displayDate in statements)) {
            statements[displayDate] = [];
          }
          statements[displayDate].push(stmt);
        }
      }
      write(response, MIMETYPE['.json'], JSON.stringify(statements));
  });
}

exports.getStatementList = getStatementList;
exports.main = main;
exports.render = render;
exports.write404 = write404;

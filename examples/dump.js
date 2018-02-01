var inspector = require('../index.js')();
var http = require('http');
var util = require('util');

var server = http.createServer(function (req, res) {
  var dump = inspector.dump();

  console.log(util.inspect(dump, false, null));
  res.end('done');
}).listen(8000);

server.on('listening', function () {
  http.get('http://127.0.0.1:8000/toto', function (res) {
    var dump = inspector.dump();

    console.log(util.inspect(dump, false, null));

    server.close();
  });
});

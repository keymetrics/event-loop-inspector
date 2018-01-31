'use strict';

var inspector = require('../index')();
var http = require('http');
var assert = require('assert');
var utils = require('./utils');

describe('HTTP server', function () {
  it('should get dump on server listening event', function (done) {
    var server = http.createServer().listen(8000, function () {
      var dump = inspector.dump();
      utils.testCommon(dump);
      assert.equal(dump.handles.hasOwnProperty('Server'), true);

      server.close();
      done();
    });
  });

  it('should get dump on request handler', function (done) {
    var server = http.createServer(function (req, res) {
      var dump = inspector.dump();
      utils.testCommon(dump);
      assert.equal(dump.handles.hasOwnProperty('Server'), true);

      res.end('done');
    }).listen(8000);

    server.on('listening', function () {
      http.get('http://127.0.0.1:8000/toto', function (res) {
        var dump = inspector.dump();

        utils.testCommon(dump);

        assert.equal(dump.handles.hasOwnProperty('Server'), true);
        assert.equal(dump.handles.Server[0].type, 'Server');
        assert.equal(dump.handles.Server[0].address, '::');
        assert.equal(dump.handles.Server[0].port, 8000);

        assert.equal(dump.handles.hasOwnProperty('Socket'), true);
        assert.equal(dump.handles.Socket[0].type, 'Socket');
        assert.equal(dump.handles.Socket[0].localAddress, '127.0.0.1');
        assert.equal(dump.handles.Socket[0].remoteAddress, '127.0.0.1');
        assert.equal(dump.handles.Socket[0].remotePort, 8000);
        assert.equal(dump.handles.Socket[0].localPort > 0, true);
        assert.equal(dump.handles.Socket[0].remoteFamily, 'IPv4');
        assert.equal(dump.handles.Socket[0].method, 'GET');
        assert.equal(dump.handles.Socket[0].path, '/toto');

        assert.equal(dump.handles.Socket[0].hasOwnProperty('headers'), true);
        assert.equal(dump.handles.Socket[0].headers.host, '127.0.0.1:8000');

        server.close();
        done();
      });
    });
  });
});

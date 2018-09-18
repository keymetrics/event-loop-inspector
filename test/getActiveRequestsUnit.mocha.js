'use strict';

var inspector = require('../index')();
var assert = require('assert');
var utils = require('./utils');
const TCPConnectWrap = process.binding('tcp_wrap').TCPConnectWrap;

describe('getActiveRequests', function () {
  var oldGetActiveRequests;

  before(function () {
    oldGetActiveRequests = process._getActiveRequests;
  });

  after(function () {
    process._getActiveRequests = oldGetActiveRequests;
  });

  it('should dump and getActiveRequests', function () {
    process._getActiveRequests = function () {
      return [null,
        new TCPConnectWrap(),
        {
          constructor: {
            name: 'WriteStream',
            _isStdio: true
          }
        }, {
          constructor: {
            name: 'WriteWrap'
          },
          handle: {
            owner: {
              _isStdio: true
            }
          }
        }];
    };

    var dump = inspector.dump();

    utils.testCommon(dump);

    assert.strictEqual(dump.requests.TCPConnectWrap[0].hasOwnProperty('address'), true);
    assert.strictEqual(dump.requests.TCPConnectWrap[0].hasOwnProperty('port'), true);
    assert.strictEqual(dump.requests.TCPConnectWrap[0].hasOwnProperty('localPort'), true);
    assert.strictEqual(dump.requests.TCPConnectWrap[0].hasOwnProperty('localAddress'), true);
  });
});

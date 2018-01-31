'use strict';

var assert = require('assert');

module.exports = {
  testCommon: function (dump) {
    assert.equal(dump.hasOwnProperty('handles'), true);
    assert.equal(dump.hasOwnProperty('requests'), true);
    assert.equal(dump.hasOwnProperty('setImmediates'), true);
    assert.equal(dump.hasOwnProperty('nextTicks'), true);
  }
};

var jons = {
  handles:
      {
        setTimeout:
            [{
              type: 'setTimeout',
              startAfter: 311,
              name: 'anonymous',
              msecs: 2000
            }],
        Server:
            [{
              type: 'Server',
              address: '::',
              port: 8000,
              listeners: [{name: 'connectionListener'}]
            }],
        Socket:
            [{
              type: 'Socket',
              localAddress: '127.0.0.1',
              localPort: 45014,
              remoteAddress: '127.0.0.1',
              remotePort: 8000,
              remoteFamily: 'IPv4',
              method: 'GET',
              path: '/toto',
              headers: {host: '127.0.0.1:8000'},
              listeners: []
            }]
      },
  requests:
      {
        TCPConnectWrap:
            [{
              type: 'TCPConnectWrap',
              address: 'xxx.xxx.xxx.xxx',
              port: xxxx,
              localAddress: 'xxx.xxx.xxx.xxx',
              localPort: xxxx
            }]
      },
  setImmediates:
      [
        {type: 'setImmediate', name: 'setImmediateTest2'},
        {type: 'setImmediate', name: 'anonymous'}
      ],
  nextTicks:
      [
        {type: 'nextTick', name: 'afterWrite'},
        {type: 'nextTick', name: 'anonymous'}
      ]
};

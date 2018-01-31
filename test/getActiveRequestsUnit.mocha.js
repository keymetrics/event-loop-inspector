'use strict';

var inspector = require('../index')();
var assert = require('assert');
var utils = require('./utils');
const {TCPConnectWrap} = process.binding('tcp_wrap');

describe('getActiveRequests', function () {

  var oldGetActiveRequests;

  before(function() {
    oldGetActiveRequests = process._getActiveRequests;
  });

  after(function() {
    process._getActiveRequests = oldGetActiveRequests;
  });

  it('should dump and getActiveRequests', function () {
    process._getActiveRequests = function () {
      return [new TCPConnectWrap()];
    };

    var dump = inspector.dump();

    utils.testCommon(dump);

    assert.equal(dump.requests.TCPConnectWrap[0].hasOwnProperty('address'), true);
    assert.equal(dump.requests.TCPConnectWrap[0].hasOwnProperty('port'), true);
    assert.equal(dump.requests.TCPConnectWrap[0].hasOwnProperty('localPort'), true);
    assert.equal(dump.requests.TCPConnectWrap[0].hasOwnProperty('localAddress'), true);
  });
});

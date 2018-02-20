'use strict';

var inspector = require('../index')();
var assert = require('assert');
var utils = require('./utils');

describe('getActiveRequests', function () {
  var oldGetActive;

  before(function () {
    oldGetActive = process._getActiveHandles;
  });

  after(function () {
    process._getActiveHandles = oldGetActive;
  });

  it('should dump and getActiveRequests', function () {
    process._getActiveHandles = function () {
      return [null,
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

    assert.equal(Object.keys(dump.requests).length === 0, true);
  });
});

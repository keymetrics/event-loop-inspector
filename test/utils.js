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

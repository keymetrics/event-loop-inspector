'use strict';

var assert = require('assert');

module.exports = {
  testCommon: function (dump) {
    assert.strictEqual(dump.hasOwnProperty('handles'), true);
    assert.strictEqual(dump.hasOwnProperty('requests'), true);
    assert.strictEqual(dump.hasOwnProperty('setImmediates'), true);
    assert.strictEqual(dump.hasOwnProperty('nextTicks'), true);
  }
};

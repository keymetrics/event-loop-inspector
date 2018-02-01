'use strict';

var inspector = require('../index')(true);
var assert = require('assert');
var utils = require('./utils');

describe('Next tick', function () {
  it('should get dump on process.nextTick', function (done) {
    process.nextTick(function nextTickTest () {
      dump = inspector.dump();
      utils.testCommon(dump);

      var isAlive = false;
      for (var i = 0; i < dump.nextTicks.length; i++) {
        if (dump.nextTicks[i].name === 'nextTickTest') {
          isAlive = true;
        }
      }
      assert.equal(isAlive, false);

      done();
    });

    var dump = inspector.dump();
    utils.testCommon(dump);
    assert.equal(dump.nextTicks.length, 2);
    assert.equal(dump.nextTicks[0].name, 'nextTickTest');
  });
});

'use strict';

var inspector = require('../index')(true);
var assert = require('assert');
var utils = require('./utils');

describe('Timers', function () {
  it('should get dump on setTimeout', function (done) {
    setTimeout(function testTimeout () {
      dump = inspector.dump();
      utils.testCommon(dump);
      assert.equal(dump.handles.hasOwnProperty('setTimeout'), true);

      done();
    }, 20);

    var dump = inspector.dump();
    utils.testCommon(dump);
    assert.equal(dump.handles.hasOwnProperty('setTimeout'), true);
    // /!\ warning : there are 2 timeout cause mocha use one :)
    assert.equal(dump.handles.setTimeout.length, 2);
    assert.equal(dump.handles.setTimeout[1].type, 'setTimeout');
    assert.equal(dump.handles.setTimeout[1].startAfter > 0, true);
    assert.equal(dump.handles.setTimeout[1].msecs, 20);
    assert.equal(dump.handles.setTimeout[1].name, 'testTimeout');
  });

  it('should get dump on setInterval', function (done) {
    var timer = setInterval(function () {
      dump = inspector.dump();
      utils.testCommon(dump);
      assert.equal(dump.handles.hasOwnProperty('setTimeout'), true);

      clearInterval(timer);
      done();
    }, 10);

    var dump = inspector.dump();
    utils.testCommon(dump);
    assert.equal(dump.handles.hasOwnProperty('setInterval'), true);
    assert.equal(dump.handles.setInterval.length, 1);
    assert.equal(dump.handles.setInterval[0].type, 'setInterval');
    assert.equal(dump.handles.setInterval[0].startAfter > 0, true);
    assert.equal(dump.handles.setInterval[0].msecs, 10);
  });

  describe('setImmediate', function () {
    it('should get dump on setImmediate', function (done) {
      setImmediate(function setImmediateTest1 () {
        dump = inspector.dump();
        utils.testCommon(dump);
        assert.equal(dump.setImmediates.length, 2);
        assert.equal(dump.setImmediates[0].name, 'setImmediateTest2');
      });

      setImmediate(function setImmediateTest2 () {
        dump = inspector.dump();
        utils.testCommon(dump);
        assert.equal(dump.setImmediates.length, 0);
        done();
      });

      var dump = inspector.dump();
      utils.testCommon(dump);
      assert.equal(dump.setImmediates.length, 4);
      assert.equal(dump.setImmediates[0].name, 'setImmediateTest1');
      assert.equal(dump.setImmediates[2].name, 'setImmediateTest2');
    });

    it('should get dump on embeded setImmediate', function (done) {
      setImmediate(function setImmediateTest1 () {
        dump = inspector.dump();
        utils.testCommon(dump);
        assert.equal(dump.setImmediates.length, 0);

        setImmediate(function setImmediateTest2 () {
          dump = inspector.dump();
          utils.testCommon(dump);
          assert.equal(dump.setImmediates.length, 0);
          done();
        });

        dump = inspector.dump();
        assert.equal(dump.setImmediates.length, 2);
        assert.equal(dump.setImmediates[0].name, 'setImmediateTest2');
      });

      var dump = inspector.dump();
      utils.testCommon(dump);
      assert.equal(dump.setImmediates.length, 2);
      assert.equal(dump.setImmediates[0].name, 'setImmediateTest1');
    });
  });
});

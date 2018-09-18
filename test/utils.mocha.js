'use strict';

var assert = require('assert');
var utils = require('../utils');

describe('getActiveRequests', function () {
  describe('extractServer', function () {
    it('should test return unknown socket', function () {
      var obj = { address: function () { throw new Error(); } };
      var res = 'no changes';
      utils.extractServer(res, obj);
      assert.strictEqual(res === 'no changes', true);
    });
  });

  describe('extractListeners', function () {
    it('should test return empty array', function () {
      var obj = {};
      var listeners = utils.extractListeners(obj);
      assert.strictEqual(listeners.length === 0, true);

      obj.listeners = {};
      listeners = utils.extractListeners(obj);
      assert.strictEqual(listeners.length === 0, true);
    });
  });

  describe('extractSocket', function () {
    it('should test return unknown socket', function () {
      var obj = {};
      var res = {};
      utils.extractSocket(res, obj);
      assert.strictEqual(res.info === 'unknown socket', true);
    });

    it('should return fd', function () {
      var obj = {
        _handle: {
          fd: 'myFd'
        }
      };
      var res = {};
      utils.extractSocket(res, obj);
      assert.strictEqual(res.fd === 'myFd', true);
    });
  });

  describe('extractTimer', function () {
    it('should test return timer even in node 4', function () {
      var obj = {
        _idleNext: {
          _idleStart: 100
        }
      };
      var res = {};
      utils.extractTimer(res, obj);
      assert.strictEqual(res.startAfter === 100, true);
      assert.strictEqual(res.name === 'anonymous', true);
    });

    it('should test return if no timer', function () {
      var obj = {};
      var res = 'no changes';
      utils.extractTimer(res, obj);
      assert.strictEqual(res === 'no changes', true);
    });
  });
});

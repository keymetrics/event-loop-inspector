'use strict';

var inspector = require('../index')();
var cluster = require('cluster');
var assert = require('assert');
var utils = require('./utils');

describe('cluster', function () {
  it('should get dump after worker init', function (done) {
    cluster.setupMaster({
      exec: './test/fixtures/worker.js'
    });

    var worker = cluster.fork();
    var pid = null;

    worker.on('online', function () {
      var dump = inspector.dump();
      utils.testCommon(dump);
      assert.equal(dump.handles.hasOwnProperty('ChildProcess'), true);
      assert.equal(dump.handles.ChildProcess[0].connected, true);
      assert.equal(dump.handles.ChildProcess[0].killed, false);
      assert.equal(dump.handles.ChildProcess[0].hasOwnProperty('pid'), true);
      assert.equal(Number.isInteger(dump.handles.ChildProcess[0].pid), true);
      var argsLength = dump.handles.ChildProcess[0].args.length;
      assert.equal(argsLength >= 3, true);
      assert.equal(dump.handles.ChildProcess[0].args[argsLength - 2], './test/fixtures/worker.js');
      assert.equal(dump.handles.ChildProcess[0].args[argsLength - 1], './test/**/*.mocha.js');
      assert.equal(dump.handles.ChildProcess[0].hasOwnProperty('spawnfile'), true);
      assert.equal(dump.handles.ChildProcess[0].spawnfile, dump.handles.ChildProcess[0].args[0]);

      pid = dump.handles.ChildProcess[0].pid;
    });

    worker.on('disconnect', function () {
      var dump = inspector.dump();
      utils.testCommon(dump);
      assert.equal(dump.handles.hasOwnProperty('ChildProcess'), true);
      assert.equal(dump.handles.ChildProcess[0].connected, false);
      assert.equal(dump.handles.ChildProcess[0].hasOwnProperty('pid'), true);
      assert.equal(dump.handles.ChildProcess[0].pid, pid);
      assert.equal(dump.handles.ChildProcess[0].killed, false);

      worker.kill();
    });

    worker.on('exit', function () {
      var dump = inspector.dump();
      utils.testCommon(dump);

      assert.equal(dump.handles.hasOwnProperty('ChildProcess'), true);
      assert.equal(dump.handles.ChildProcess[0].connected, false);
      assert.equal(dump.handles.ChildProcess[0].hasOwnProperty('pid'), true);
      assert.equal(dump.handles.ChildProcess[0].pid, pid);
      assert.equal(dump.handles.ChildProcess[0].killed, true);

      done();
    });
  });
});

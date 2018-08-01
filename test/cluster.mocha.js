'use strict';

var inspector = require('../index')();
var cluster = require('cluster');
var fork = require('child_process').fork;
var exec = require('child_process').exec;
var assert = require('assert');
var utils = require('./utils');

describe('Child process', function () {
  it('should get dump after cluster/worker init', function (done) {
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

  it('should get dump after fork', function (done) {
    const child = fork('./test/fixtures/childFork.js');

    child.kill('SIGINT');

    child.on('exit', function () {
      var dump = inspector.dump();
      utils.testCommon(dump);

      assert.equal(dump.handles.hasOwnProperty('ChildProcess'), true);
      assert.equal(dump.handles.ChildProcess[0].connected, false);
      assert.equal(dump.handles.ChildProcess[0].hasOwnProperty('pid'), true);
      assert.equal(dump.handles.ChildProcess[0].killed, true);
      done();
    });
  });

  it('should get dump after exec', function (done) {
    const child = exec('./test/fixtures/childFork.js');

    child.kill('SIGINT');

    child.on('exit', function () {
      var dump = inspector.dump();
      utils.testCommon(dump);

      assert.equal(dump.handles.hasOwnProperty('ChildProcess'), true);
      assert.equal(dump.handles.ChildProcess[0].connected, false);
      assert.equal(dump.handles.ChildProcess[0].hasOwnProperty('pid'), true);
      assert.equal(dump.handles.ChildProcess[0].args[2], './test/fixtures/childFork.js');
      assert.equal(dump.handles.ChildProcess[0].killed, true);
      done();
    });
  });
});

if (require('semver').satisfies(process.version, '>= 10.5.0')) {
  const {
    Worker, MessageChannel
  } = require('worker_threads');

  describe('Threads', function () {
    it('should get dump after worker/thread', function (done) {
      const worker = new Worker(__dirname + '/fixtures/childFork.js');

      const subChannel = new MessageChannel();
      worker.postMessage({hereIsYourPort: subChannel.port1}, [subChannel.port1]);
      subChannel.port2.on('message', (value) => {
        assert.equal(value, 'the worker is sending this');

        const dump = inspector.dump();
        assert.equal(dump.handles.hasOwnProperty('MessagePort'), true);
        assert.equal(dump.handles.MessagePort[0].listeners.length, 3);
        assert.equal(dump.handles.MessagePort[0].listeners[2], 'message');
        subChannel.port2.close();
        worker.terminate();
      });

      worker.on('online', function () {
        const dump = inspector.dump();
        assert.equal(dump.handles.hasOwnProperty('MessagePort'), true);
      });

      worker.on('exit', function () {
        // check MessagePort is cleaned after a certain time
        const timer = setInterval(function () {
          const dump = inspector.dump();
          if (!dump.handles.hasOwnProperty('MessagePort') || dump.handles.MessagePort.length === 0) {
            clearInterval(timer);
            done();
          }
        }, 200);
      });
    });
  });
}

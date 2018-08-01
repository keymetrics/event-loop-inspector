'use strict';

const {
  parentPort
} = require('worker_threads');

parentPort.once('message', (value) => {
  value.hereIsYourPort.postMessage('the worker is sending this');
  value.hereIsYourPort.close();
});

'use strict';

var cluster = require('cluster');

cluster.worker.disconnect();
cluster.worker.destroy();

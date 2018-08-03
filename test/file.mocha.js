'use strict';

var fs = require('fs');
var path = require('path');
var filePath = path.join(__dirname, '/fixtures/log.txt');
var readStream = fs.createReadStream(filePath);
var inspector = require('../index')();
var assert = require('assert');
var utils = require('./utils');

describe('Files', function () {
  it('should get dump when reading a file as stream', function (done) {
    readStream
      .on('readable', function myFunc () {
        while (readStream.read() !== null) {
          var dump = inspector.dump();
          utils.testCommon(dump);
          assert.equal(dump.requests.hasOwnProperty('FSReqWrap'), true);
          assert.equal(dump.requests.FSReqWrap.length > 0, true);
        }
      })
      .on('end', function () {
        done();
      });
  });

  it('should get dump when writing a file', function (done) {
    var chunk;
    readStream = fs.createReadStream(filePath);
    readStream
      .on('readable', function myFunc () {
        while ((chunk = readStream.read()) !== null) {
          var dump = inspector.dump();
          assert.equal(dump.requests.FSReqWrap.length > 0, true);
          fs.writeFile(path.join(__dirname, '/fixtures/tmp/log_copy.txt'), chunk, function (err) {
            if (err) {
              console.log(err);
            }

            var dump = inspector.dump();
            assert.equal(dump.requests.FSReqWrap.length > 0, true);
          });
        }
      })
      .on('end', function () {
        done();
      });
  });

  it('should get dump when reading a file', function (done) {
    fs.readFile(filePath, 'utf8', function myCb (err, contents) {
      if (err) console.log(err);
      done();
    });
    var dump = inspector.dump();
    assert.equal(dump.requests.hasOwnProperty('FSReqWrap'), true);
    assert.equal(dump.requests.FSReqWrap.length > 0, true);
  });
});

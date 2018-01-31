'use strict';

module.exports = function (allowWrapper) {
  if (allowWrapper) {
    global.setImmediate = wrapCallbackFirst(global, 'setImmediate');
    process.nextTick = wrapCallbackFirst(process, 'nextTick');
    global.activeSetImmediateAndNextTick = {counter: 0};
  }

  return {
    dump: function () {
      var handles = {};
      var requests = {};
      var setImmediates = [];
      var nextTicks = [];

      process._getActiveHandles().forEach(function (h) {
        if (!h) {
          return;
        }

        // skip stdio
        if ((h.constructor.name === 'WriteStream' || h.constructor.name === 'WriteWrap') && h._isStdio) {
          return;
        }

        var obj = {
          type: h.constructor.name
        };

        if (obj.type === 'Server') {
          extractServer(obj, h);
        } else if (obj.type === 'Socket') {
          extractSocket(obj, h);
        } else if (obj.type === 'Timer') {
          extractTimer(obj, h);
        } else if (obj.type === 'ChildProcess') {
          extractChildProcess(obj, h);
        }

        // create array if this is the first item of this type
        if (!handles[obj.type]) {
          handles[obj.type] = [];
        }

        handles[obj.type].push(obj);
      });

      process._getActiveRequests().forEach(function (r) {
        if (!r) {
          return;
        }

        // skip stdio
        if ((r.constructor.name === 'WriteStream' || r.constructor.name === 'WriteWrap') && r.handle.owner._isStdio) {
          return;
        }

        var obj = {
          type: r.constructor.name
        };

        if (obj.type === 'TCPConnectWrap') {
          extractTCPWrap(obj, r);
        }

        // create array if this is the first item of this type
        if (!requests[obj.type]) {
          requests[obj.type] = [];
        }

        requests[obj.type].push(obj);
      });

      for (var key in global.activeSetImmediateAndNextTick) {
        var item = global.activeSetImmediateAndNextTick[key];
        if (item.type === 'setImmediate') {
          setImmediates.push(item);
        } else if (item.type === 'nextTick') {
          nextTicks.push(item);
        }
      }

      return {
        handles: handles,
        requests: requests,
        setImmediates: setImmediates,
        nextTicks: nextTicks
      };
    }
  };
};

function extractServer (result, server) {
  try {
    var a = server.address();
  } catch (e) {
    return;
  }

  if (a) {
    result.address = a.address;
    result.port = a.port;
  }

  result.listeners = extractListeners(server, 'connection');
}

function extractSocket (result, socket) {
  if (socket.localAddress) {
    result.localAddress = socket.localAddress;
    result.localPort = socket.localPort;
    result.remoteAddress = socket.remoteAddress;
    result.remotePort = socket.remotePort;
    result.remoteFamily = socket.remoteFamily;
  } else if (socket._handle && (socket._handle.fd != null)) {
    result.fd = socket._handle.fd;
  } else {
    result.info = 'unknown socket';
  }

  if (socket.parser && socket.parser.outgoing) {
    result.method = socket.parser.outgoing.method;
    result.path = socket.parser.outgoing.path;
    result.headers = socket.parser.outgoing._headers;
  }

  result.listeners = extractListeners(socket, 'connect');
}

function extractListeners (obj, listenerName) {
  var listerners = [];

  if (!obj.listeners || typeof obj.listeners !== 'function') {
    return listerners;
  }

  var connectListeners = obj.listeners(listenerName);
  if (connectListeners && connectListeners.length) {
    connectListeners.forEach(function (fn) {
      listerners.push({
        name: fn.name || '(anonymous)'
      });
    });
  }

  return listerners;
}

function extractTimer (result, timer) {
  var type = 'setTimeout';
  if (timer._list) {
    if (timer._list._idleNext) {
      if (timer._list._idleNext._repeat !== null) {
        type = 'setInterval';
      }

      result.startAfter = timer._list._idleNext._idleStart;
    }

    result.name = timer._list && timer._list._idleNext &&
    timer._list._idleNext._onTimeout &&
    timer._list._idleNext._onTimeout.name !== '' ? timer._list._idleNext._onTimeout.name : 'anonymous';
    result.type = type;
    result.msecs = timer._list.msecs;
  }
}

function extractChildProcess (result, child) {
  result.args = child.spawnargs;
  result.spawnfile = child.spawnfile;
  result.pid = child.pid;
  result.connected = child.connected;
  result.killed = child.killed;
}

function extractTCPWrap (result, tcp) {
  result.address = tcp.address;
  result.port = tcp.port;
  result.localAddress = tcp.localAddress;
  result.localPort = tcp.localPort;
}

function wrapCallbackFirst (mod, name) {
  var orig = mod[name];

  return function () {
    // clone arguments so we can inject our own callback
    var args = [];
    for (var n = 0; n < arguments.length; n++) {
      args[n] = arguments[n];
    }

    // inject our own callback
    var userCallback = args[0];

    global.activeSetImmediateAndNextTick[global.activeSetImmediateAndNextTick.counter] = {
      type: name,
      name: userCallback.name || 'anonymous'
    };

    (function (index) {
      args[0] = function () {
        delete global.activeSetImmediateAndNextTick[index];

        // call the original callback
        return userCallback.apply(this, arguments);
      };
    })(global.activeSetImmediateAndNextTick.counter);

    global.activeSetImmediateAndNextTick.counter++;

    return orig.apply(mod, args);
  };
}

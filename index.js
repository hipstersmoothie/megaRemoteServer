var http = require('http'),
  express = require('express'),
  cors = require('cors'),
  _ = require('lodash'),
  path = require('path'),
  discoverHub = require('./harmonyConnect'),
  HarmonyUtils = require('harmony-hub-util');

var app = express();
app.use(cors());
app.set('port', process.env.PORT || 5000);
app.use(express.static(path.join(__dirname, 'public')));

function error(res, name) {
  return function (err) {
    res.send("\tERROR Getting current " + name + " on the Hub : " + err);
  }
}

function send(res) {
  return function (data) {
    res.send(data);
  }
}

var queue = [],
  firstRunCalled;

function nextResource() {
  if (queue.length) {
    var nextCall = queue.pop();
    getResource(nextCall.type, nextCall.res, nextCall.func, true);
  }
}

function getResource(type, res, func, forceRun) {
  if (firstRunCalled && !forceRun) {
    return queue.unshift({
      type: type,
      res: res,
      func: func
    })
  }

  firstRunCalled = true;

  discoverHub(function (ip, online) {
    var util;

    new HarmonyUtils(ip)
      .then(function (hUtil) {
        util = hUtil;
        nextResource();
        return func(hUtil)
      }, error(res, type))
      .then(function (res) {
        util.end();

        if (!queue.length) {
          firstRunCalled = false;
        }

        return res;
      })
      .then(send(res), error(res, type))
  });
}

// Utility

app.post('/allOff/:toggleSecondary', function (req, res) {
  discoverHub(function (ip, online) {
    var util;

    new HarmonyUtils(ip)
      .then(function (hUtil) {
        util = hUtil;
        return util.readDevices();
      })
      .then(function (res) {
        util.end();
        return res;
      })
      .then(function (devices) {
        _.forEach(devices, function (device, index) {
          getResource('devices', { send: _.noop }, function (hUtil) {
            return hUtil.executeCommand(true, device, device == 'Vizio TV' && req.params.toggleSecondary == 'true' ? 'PowerToggle' : 'PowerOff');
          });
        })
      }, error(res, 'allOff'))
  });
});

// Activities

app.get('/activities', function (req, res) {
  getResource('activities', res, function (hUtil) {
    return hUtil.readActivities();
  });
});

app.get('/activities/current', function (req, res) {
  getResource('activities', res, function (hUtil) {
    return hUtil.readCurrentActivity();
  });
});

app.get('/activities/:activity', function (req, res) {
  getResource('activities', res, function (hUtil) {
    return hUtil._readActivityCommands(req.params.activity);
  });
});

app.post('/activities/:activity', function (req, res) {
  getResource('activities', res, function (hUtil) {
    return hUtil.executeActivity(req.params.activity)
  });
});

app.post('/activities/:activity/:command', function (req, res) {
  getResource('activities', res, function (hUtil) {
    return hUtil.executeCommand(false, req.params.activity, req.params.command)
  });
});

// Devices

app.get('/devices', function (req, res) {
  getResource('devices', res, function (hUtil) {
    return hUtil.readDevices()
  });
});

app.get('/devices/:device', function (req, res) {
  getResource('devices', res, function (hUtil) {
    return hUtil._readDeviceCommands(req.params.device)
  });
});

app.post('/devices/:device/:command', function (req, res) {
  getResource('devices', res, function (hUtil) {
    return hUtil.executeCommand(true, req.params.device, req.params.command)
  });
});

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
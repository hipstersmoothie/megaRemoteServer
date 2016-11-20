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

function getResource(type, res, func) {
  discoverHub(function (ip, online) {
    var util;
    
    new HarmonyUtils(ip)
      .then(function (hUtil) {
        util = hUtil;
        return func(hUtil)
      })
      .then(send(res), error(res, type))
      .then(function () {
        util.end();
      })
  });
}

// Utility

app.post('/allOff', function (req, res) {
  discoverHub(function (ip, online) {
    var util;

    new HarmonyUtils(ip)
      .then(function (hUtil) {
        util = hUtil;
        return util.readDevices();
      })
      .then(function (res) {
        _.forEach(res, function (device, index) {
          setTimeout(function () {
            console.log(device)
            getResource('devices', res, function (hUtil) {
              return hUtil.executeCommand(true, device, device == 'Vizio TV' ? 'PowerToggle' : 'PowerOff');
            });
          }, index * 1100)
        })
      }, error(res, 'allOff'))
      .then(function () {
        util.end();
      })
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
  console.log(req.params)
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
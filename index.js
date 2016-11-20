var http = require('http'),
  express = require('express'),
  cors = require('cors'),
  _ = require('lodash'),
  path = require('path'),
  discoverHub = require('./harmonyConnect'),
  HarmonyUtils = require('harmony-hub-util'),
  hubIp = null,
  hubUtil = null;

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

// Activities

app.get('/activities', function (req, res) {
  if (hubIp && hubUtil) {
    hubUtil.readActivities()
      .then(send(res), error(res, 'activities'))
  } else {
    res.send('No hub');
  }
});

app.get('/activities/current', function (req, res) {
  if (hubIp && hubUtil) {
    hubUtil.readCurrentActivity()
      .then(send(res), error(res, 'activities'))
  } else {
    res.send('No hub');
  }
});

app.get('/activities/:activity', function (req, res) {
  if (hubIp && hubUtil) {
    hubUtil._readActivityCommands(req.params.activity)
      .then(send(res), error(res, 'activities'))
  } else {
    res.send('No hub');
  }
});

app.post('/activities/:activity', function (req, res) {
  if (hubIp && hubUtil) {
    hubUtil.executeActivity(req.params.activity)
      .then(send(res), error(res, 'activities'))
  } else {
    res.send('No hub');
  }
});

app.post('/activities/:activity/:command', function (req, res) {
  if (hubIp && hubUtil) {
    hubUtil.executeActivityCommand(req.params.activity, req.params.command)
      .then(send(res), error(res, 'activities'))
  } else {
    res.send('No hub');
  }
});

// Devices

app.get('/devices', function (req, res) {
  if (hubIp && hubUtil) {
    hubUtil.readDevices()
      .then(send(res), error(res, 'devices'))
  } else {
    res.send('No hub');
  }
});

app.get('/devices/:device', function (req, res) {
  if (hubIp && hubUtil) {
    hubUtil._readDeviceCommands(req.params.device)
      .then(send(res), error(res, 'devices'))
  } else {
    res.send('No hub');
  }
});

app.post('/devices/:device/:command', function (req, res) {
  if (hubIp && hubUtil) {
    hubUtil.executeCommand(true, req.params.device, req.params.command)
      .then(send(res), error(res, 'devices'))
  } else {
    res.send('No hub');
  }
});

discoverHub(function (ip, add) {
  hubIp = ip;
  new HarmonyUtils(hubIp)
    .then(function (hUtil) {
      hubUtil = hUtil;
    });
});

http.createServer(app).listen(app.get('port'), function () {
  // if (process && process.env && process.env.NODE_ENV !== 'development') {
  //   console.log = function () { };
  // }
  console.log('Express server listening on port ' + app.get('port'));
});
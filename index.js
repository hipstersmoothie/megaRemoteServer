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

var queue = []
  threads = [];

function nextResource() {
  threads.pop();

  if (queue.length) {
    var nextCall = queue.pop();
    getResource(nextCall.type, nextCall.res, nextCall.func, true);
  }
}

function getResource(type, res, func, forceRun) {
  if(threads.length === 2) {
    return queue.unshift({
      type: type,
      res: res,
      func: func
    })
  }

  threads.push(type);

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
        return res;
      }, error(res, type))
      .then(send(res))
  });
}

// Utility
const Hs100Api = require('hs100-api');
const client = new Hs100Api.Client();
const plug = client.getPlug({host: '192.168.1.41'});

app.post('/allOff/', function (req, res) {
  discoverHub(function (ip, online) {
    var util;
    var devices;

    new HarmonyUtils(ip)
      .then(function (hUtil) {
        util = hUtil;
        return util.readDevices();
      })
      .then(function (res) {
        util.end();
        return res;
      })
      .then(function (res) {
        devices = res;
        return plug.getConsumption();
      })
      .then(function (consumption) {
        _.forEach(devices, function (device, index) {
          getResource('devices', { send: _.noop }, function (hUtil) {
            return hUtil.executeCommand(true, device, device == 'Vizio TV' && consumption.get_realtime.power > 50 ? 'PowerToggle' : 'PowerOff');
          });
        })
      }, error(res, 'allOff'))
  });

  request
    .put('http://' + hostname + '/api/FcJqOpkx2ypbqUhrdTWGog9pAmDKGjpNn04hNITh/groups/1/action')
    .send({"on": false })
    .set('Accept', 'application/json')
    .end(function(err, result) {
      res.send(result);
    });
});

// Volume

var util = require('util'),
    eiscp = require('eiscp');

eiscp.connect();
eiscp.on('debug', util.log);
eiscp.on('error', util.log);

var c;
var command = function() {
  if(c) {
    eiscp.command(c);
    c = null;
  }
};

eiscp.on('connect', command);

app.get('/volume', function (req, res) {  
  c = "volume=query";
  eiscp.command(c);

  eiscp.on('volume', function (volume) {
    try {
      res.send({ volume: volume });
    } catch (e) {}
  });
});

app.post('/volume/:level', function (req, res) {
  c = "main.volume=" + req.params.level;
  res.send(eiscp.command(c));
});

// Lights

var HueApi = require("node-hue-api").HueApi,
  request = require('superagent');

var displayResult = function(result) {
    console.log(JSON.stringify(result, null, 2));
};

var hostname = "192.168.1.2",
    username = "FcJqOpkx2ypbqUhrdTWGog9pAmDKGjpNn04hNITh",
    livingRoomLights = [
      "6",
      "5",
      "7",
      "21",
      "20",
      "24"
    ],
    livingRoomLightNames = [
      "Recliner", 
      "Entryway",
      "TV Corner",
      "Upper 1",
      "Upper 2",
      "Beehive"
    ],
    api;

api = new HueApi(hostname, username);

app.get('/lights', function (req, res) {
  res.send(_.zip(livingRoomLights, livingRoomLightNames));
});

app.get('/scenes', function (req, res) {
  api.scenes(function(err, result) {
    if (err) throw err;
    res.send(_.filter(result, function(scene) {
      return scene.recycle !== true && _.find(scene.lights, function(light) {
        return livingRoomLights.indexOf(light) > -1;
      })
    }));
  });
});

app.get('/scenes/:scene', function (req, res) {
  api.getScene(req.params.scene, function(err, result) {
    if (err) throw err;
    res.send(result)
  });
});

app.post('/scenes/:scene', function (req, res) {
  request
    .put('http://' + hostname + '/api/FcJqOpkx2ypbqUhrdTWGog9pAmDKGjpNn04hNITh/groups/1/action')
    .send({"scene": req.params.scene })
    .set('Accept', 'application/json')
    .end(function(err, result) {
      res.send(result);
    });
});

app.get('/brightness', function (req, res) {
  request
    .get('http://' + hostname + '/api/FcJqOpkx2ypbqUhrdTWGog9pAmDKGjpNn04hNITh/groups/1/')
    .end(function(err, result) {
      if (result.text) {
        var brightness = (JSON.parse(result.text).action.bri / 255) * 100;
        res.send({bri: brightness});
      } else {
        res.send(null);
      }
    });
});

app.post('/brightness/:bri', function (req, res) {
  request
    .put('http://' + hostname + '/api/FcJqOpkx2ypbqUhrdTWGog9pAmDKGjpNn04hNITh/groups/1/action')
    .send({ bri: Math.round((parseInt(req.params.bri) / 100) * 255) })
    .set('Accept', 'application/json')
    .end(function(err, result) {
        res.send(result);
    });
});

// Returns a random number between min (inclusive) and max (exclusive)
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

app.post('/scenes/:scene', function (req, res) {
  var scheme = new ColorScheme;
  scheme.from_hue(getRandomArbitrary(360))         
    .scheme('triade')   
    .variation('soft');

  var colors = scheme.colors();
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
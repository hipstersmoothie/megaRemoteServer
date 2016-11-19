var events = require('events'),
  HarmonyHubDiscover = require('harmonyhubjs-discover'),
  discover;

function discoverHub(callBackFn) {
  if (discover === null || discover === undefined) {
    discover = new HarmonyHubDiscover(61991);
  }

  discover.on('online', function (hub) {
    callBackFn(hub.ip, true);
  });
  discover.on('offline', function (hub) {
    callBackFn(hub.ip, false);
  });

  discover.start();
}

module.exports = discoverHub;

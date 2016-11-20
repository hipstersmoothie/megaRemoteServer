var events = require('events'),
  HarmonyHubDiscover = require('harmonyhubjs-discover'),
  discover, ip = '192.168.0.24';

function discoverHub(callBackFn) {
  if (ip)
    callBackFn(ip, true);

  // if (discover === null || discover === undefined) {
  //   discover = new HarmonyHubDiscover(61991);
  // }

  // discover.on('online', function (hub) {
  //   callBackFn(hub.ip, true);
  // });
  // discover.on('offline', function (hub) {
  //   callBackFn(hub.ip, false);
  // });

  // discover.start();
}

module.exports = discoverHub;

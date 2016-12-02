var events = require('events'),
  HarmonyHubDiscover = require('harmonyhubjs-discover'),
  discover, ip = '192.168.1.8';

function discoverHub(callBackFn) {
  if (ip)
    return callBackFn(ip, true);

  // if (discover === null || discover === undefined) {
  //   discover = new HarmonyHubDiscover(61992);
  // }

  // discover.on('online', function (hub) {
  //   console.log('foo', hub)
  //   ip = hub.ip;
  //   callBackFn(hub.ip, true);
  //   discover.stop()
  // });
  // discover.on('offline', function (hub) {
  //   console.log('foo2', hub)
  //   ip = hub.ip;
  //   callBackFn(hub.ip, false);
  //   discover.stop()
  // });

  // discover.start();
}

module.exports = discoverHub;

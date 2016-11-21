var events = require('events'),
  HarmonyHubDiscover = require('harmonyhubjs-discover'),
  discover, ip = '192.168.0.5';

//192.168.0.5
function discoverHub(callBackFn) {
  // console.log(ip)
  if (ip)
    return callBackFn(ip, true);

  // if (discover === null || discover === undefined) {
  //   discover = new HarmonyHubDiscover(61991);
  // }

  // discover.on('online', function (hub) {
  //   ip = hub.ip;
  //   callBackFn(hub.ip, true);
  //   discover.stop()
  // });
  // discover.on('offline', function (hub) {
  //   ip = hub.ip;
  //   callBackFn(hub.ip, false);
  //   discover.stop()
  // });

  // discover.start();
}

module.exports = discoverHub;

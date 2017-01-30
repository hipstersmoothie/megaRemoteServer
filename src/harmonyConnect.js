// import events from 'events';
// import HarmonyHubDiscover from 'harmonyhubjs-discover';

// let discover;
const ip = '192.168.1.6';

export default function discoverHub(callBackFn) {
  if (ip) {
    callBackFn(ip, true);
  }

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

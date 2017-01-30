import HarmonyUtils from 'harmony-hub-util';
import discoverHub from '../harmonyConnect';

export function error(res, name) {
  return (err) => {
    res.send(`\tERROR Getting current ${name} on the Hub : ${err}`);
  };
}

export function send(res) {
  return (data) => {
    res.send(data);
  };
}

const queue = [];
const threads = [];

function nextResource() {
  threads.pop();

  if (queue.length) {
    const nextCall = queue.pop();
    getResource(nextCall.type, nextCall.res, nextCall.func, true);
  }
}

export function getResource(type, res, func) {
  if (threads.length === 2) {
    return queue.unshift({
      type,
      res,
      func
    });
  }

  threads.push(type);

  discoverHub((ip) => {
    let util;

    new HarmonyUtils(ip)
      .then((hUtil) => {
        util = hUtil;
        nextResource();
        return func(hUtil);
      }, error(res, type))
      .then((result) => {
        util.end();
        return result;
      }, error(res, type))
      .then(send(res));
  });
}

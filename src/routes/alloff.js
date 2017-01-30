import _ from 'lodash';
import express from 'express';
import request from 'superagent';
import Hs100Api from 'hs100-api';
import HarmonyUtils from 'harmony-hub-util';

import discoverHub from '../harmonyConnect';
import { error, getResource } from './utils';

const router = express.Router();
const client = new Hs100Api.Client();
const plug = client.getPlug({ host: '192.168.1.41' });
const hueHostname = '192.168.1.2';

router.post('/allOff/', (req, res) => {
  discoverHub((ip) => {
    let util;
    let devices;

    new HarmonyUtils(ip)
      .then((hUtil) => {
        util = hUtil;
        return util.readDevices();
      })
      .then((result) => {
        util.end();
        return result;
      })
      .then((result) => {
        devices = result;
        return plug.getConsumption();
      })
      .then((consumption) => {
        _.forEach(devices, (device) => {
          getResource('devices', { send: _.noop }, hUtil => (
            hUtil.executeCommand(true, device, device === 'Vizio TV' && consumption.get_realtime.power > 50 ? 'PowerToggle' : 'PowerOff')
          ));
        });
      }, error(res, 'allOff'));
  });

  request
    .put(`http://${hueHostname}/api/FcJqOpkx2ypbqUhrdTWGog9pAmDKGjpNn04hNITh/groups/1/action`)
    .send({ on: false })
    .set('Accept', 'application/json')
    .end((err, result) => {
      res.send(result);
    });
});

export default router;

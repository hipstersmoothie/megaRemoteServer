import express from 'express';
import Hs100Api from 'hs100-api';
import { getResource } from './utils';

const router = express.Router();
const client = new Hs100Api.Client();
const plug = client.getPlug({ host: '192.168.1.41' });

router.get('/devices', (req, res) => {
  getResource('devices', res, hUtil => hUtil.readDevices());
});

router.get('/devices/:device', (req, res) => {
  getResource('devices', res, hUtil => hUtil._readDeviceCommands(req.params.device));
});

router.post('/devices/:device/:command', (req, res) => {
  if (req.params.device === 'Vizio TV' && req.params.command === 'PowerOn') {
    plug.getConsumption().then((consumption) => {
      if (consumption.get_realtime.power < 50) {
        doCommand('PowerToggle');
      } else {
        res.send(false);
      }
    });
  } else {
    doCommand();
  }

  function doCommand(command) {
    getResource('devices', res, hUtil => hUtil.executeCommand(true, req.params.device, command || req.params.command));
  }
});

export default router;

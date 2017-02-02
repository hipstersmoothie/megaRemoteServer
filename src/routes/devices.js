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

let main = '';
let secondary = '';

function setAreas(req) {
  if (req.params.device === 'Onkyo AV Receiver' && req.params.command !== 'PowerOn' && req.params.command !== 'PowerOff') {
    main = req.params.command;
  }

  if (req.params.device === 'Onkyo AV Receiver (2)' && req.params.command !== 'PowerOn' && req.params.command !== 'PowerOff') {
    secondary = req.params.command;
  }
}

function doCommand(req, res, device, command) {
  getResource('devices', res, hUtil => hUtil.executeCommand(true, device || req.params.device, command || req.params.command));
}

function VizioOn(req, res) {
  plug.getConsumption().then((consumption) => {
    if (consumption.get_realtime.power < 50) {
      doCommand(req, res, null, 'PowerToggle');
    } else {
      res.send(false);
    }
  });
}

router.post('/switch', (req, res) => {
  doCommand(req, { send: () => {} }, 'Onkyo AV Receiver', secondary);
  doCommand(req, res, 'Onkyo AV Receiver (2)', main);
});

router.post('/devices/:device/:command', (req, res) => {
  setAreas(req);

  if (req.params.device === 'Vizio TV' && req.params.command === 'PowerOn') {
    VizioOn(req, res);
  } else {
    doCommand(req, res);
  }
});

export default router;

import _ from 'lodash';
import express from 'express';
import request from 'superagent';
import { api as HueApi } from 'node-hue-api';

const router = express.Router();
const hostname = '192.168.1.2';
const username = 'FcJqOpkx2ypbqUhrdTWGog9pAmDKGjpNn04hNITh';
const livingRoomLights = [
  '6',
  '5',
  '7',
  '21',
  '20',
  '24'
];
const livingRoomLightNames = [
  'Recliner',
  'Entryway',
  'TV Corner',
  'Upper 1',
  'Upper 2',
  'Beehive'
];


const api = new HueApi(hostname, username);

router.get('/lights', (req, res) => {
  res.send(_.zip(livingRoomLights, livingRoomLightNames));
});

router.get('/scenes', (req, res) => {
  api.scenes((err, result) => {
    if (err) throw err;

    res.send(_.filter(result, scene => (
      scene.recycle !== true && _.find(scene.lights, light => livingRoomLights.indexOf(light) > -1))
    ));
  });
});

router.get('/scenes/:scene', (req, res) => {
  api.getScene(req.params.scene, (err, result) => {
    if (err) throw err;

    res.send(result);
  });
});

router.post('/scenes/:scene', (req, res) => {
  request
    .put(`http://${hostname}/api/FcJqOpkx2ypbqUhrdTWGog9pAmDKGjpNn04hNITh/groups/1/action`)
    .send({ scene: req.params.scene })
    .set('Accept', 'application/json')
    .end((err, result) => {
      res.send(result);
    });
});

router.get('/brightness', (req, res) => {
  request
    .get(`http://${hostname}/api/FcJqOpkx2ypbqUhrdTWGog9pAmDKGjpNn04hNITh/groups/1/`)
    .end((err, result) => {
      if (result.text) {
        const bri = (JSON.parse(result.text).action.bri / 255) * 100;
        res.send({ bri });
      } else {
        res.send(null);
      }
    });
});

router.post('/brightness/:bri', (req, res) => {
  request
    .put(`http://${hostname}/api/FcJqOpkx2ypbqUhrdTWGog9pAmDKGjpNn04hNITh/groups/1/action`)
    .send({ bri: Math.round((parseInt(req.params.bri, 10) / 100) * 255) })
    .set('Accept', 'application/json')
    .end((err, result) => {
      res.send(result);
    });
});

export default router;

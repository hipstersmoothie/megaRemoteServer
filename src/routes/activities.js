import express from 'express';
import { getResource } from './utils';

const router = express.Router();

router.get('/activities', (req, res) => {
  getResource('activities', res, hUtil => hUtil.readActivities());
});

router.get('/activities/current', (req, res) => {
  getResource('activities', res, hUtil => hUtil.readCurrentActivity());
});

router.get('/activities/:activity', (req, res) => {
  getResource('activities', res, hUtil => hUtil._readActivityCommands(req.params.activity));
});

router.post('/activities/:activity', (req, res) => {
  getResource('activities', res, hUtil => hUtil.executeActivity(req.params.activity));
});

router.post('/activities/:activity/:command', (req, res) => {
  getResource('activities', res, hUtil => hUtil.executeCommand(false, req.params.activity, req.params.command));
});

export default router;

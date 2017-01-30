import util from 'util';
import eiscp from 'eiscp';
import express from 'express';

const router = express.Router();

eiscp.connect();
eiscp.on('debug', util.log);
eiscp.on('error', util.log);

let c;
function command() {
  if (c) {
    eiscp.command(c);
    c = null;
  }
}

eiscp.on('connect', command);

router.get('/volume', (req, res) => {
  c = 'volume=query';
  eiscp.command(c);

  eiscp.on('volume', (volume) => {
    try {
      res.send({ volume });
    } catch (e) {
      util.log(e);
    }
  });
});

router.post('/volume/:level', (req, res) => {
  c = `main.volume=${req.params.level}`;
  res.send(eiscp.command(c));
});

export default router;

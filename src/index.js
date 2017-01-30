import http from 'http';
import express from 'express';
import cors from 'cors';
import path from 'path';

import volume from './routes/volume';
import lights from './routes/lights';
import activities from './routes/activities';
import devices from './routes/devices';
import alloff from './routes/alloff';

const app = express();

app.use(cors());
app.set('port', process.env.PORT || 5000);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', volume);
app.use('/', lights);
app.use('/', activities);
app.use('/', devices);
app.use('/', alloff);

http.createServer(app).listen(app.get('port'), () => {
  console.log(`Express server listening on port ${app.get('port')}`); // eslint-disable-line no-console
});

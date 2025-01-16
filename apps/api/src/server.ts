import express from 'express';
import http from 'http';
import setWebSocket from './webSocket';

const app = express();

const server = http.createServer(app);

setWebSocket(server);

const port = 8080;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

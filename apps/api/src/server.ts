import express from 'express';
import http from 'http';
import socket from 'ws';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello, Node.js Backend!');
});

const server = http.createServer(app);
const ws = new socket.Server({ server });

ws.on('connection', socket => {
  socket.on('message', message => {
    console.log(`Received message => ${message}`);
    socket.send(`Received message => ${message}`);
  });

  socket.on('close', () => {
    console.log('Client disconnected');
  });
});

const port = 3001;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

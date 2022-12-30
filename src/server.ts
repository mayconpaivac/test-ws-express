import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { server, app } from './app';
import { io } from './ws';
import { router } from './routes';

app.use(express.json());
app.use(router);
app.use(cors({origin: '*'}));

io.on('connection', async (socket) => {
  const token = socket.handshake.headers.authorization?.split('|')[1];

  if (!token) {
    socket.disconnect();
  } else {
    console.log(`client connected: ${socket.id}`)
  }

  
  socket.on("disconnect", (reason) => {
    console.log(`client disconnected: ${socket.id} // ${reason}`)
  });
});

server.listen(3333, () => {
  console.log('server started on port 3333.')
})
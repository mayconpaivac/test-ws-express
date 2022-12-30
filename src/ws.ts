import { server } from './app';
import socketIo from 'socket.io';

const io = new socketIo.Server(server, {
  cors: {
    origin: '*'
  }
});

export { io };

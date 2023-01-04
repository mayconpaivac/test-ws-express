import { httpServer } from "./app";
import { Server } from "socket.io";

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

export { io };

import express from "express";
import cors from "cors";
import { httpServer, app } from "./app";
import { io } from "./ws";
import { router } from "./routes";
import { prismaClient } from "./database/prismaClient";
import { verifyToken } from "./middlewares/verifyToken";

app.use(express.json());
app.use(router);
app.use(cors({ origin: "*" }));

io.use(verifyToken);

io.on("connection", async (socket) => {
  try {
    await prismaClient.user.update({
      where: { id: socket.user?.id },
      data: { online: true },
    });

    socket.on("connect-chat", async (chatId) => {
      const check = await prismaClient.chat.findFirst({
        where: {
          id: String(chatId),
          AND: { driver_id: socket.user.id, OR: { user_id: socket.user.id } },
        },
      });

      if (check) {
        socket.join(`chat-${chatId}`);
      } else {
        console.log(`user ${socket.user.id} not connected on chat ${chatId}.`);
      }
    });

    socket.on("message", (e) => {
      console.log({ e });

      io.emit("message", { message: e, name: socket.user.name });
    });

    socket.on("disconnect", async (reason) => {
      console.log(
        `client disconnected: ${socket.id} user id: ${socket.user.id} // ${reason}`
      );
      await prismaClient.user.update({
        where: { id: socket.user.id },
        data: { online: false },
      });
    });
  } catch (err) {
    socket.disconnect();
    console.log(`error: ${err}`);
  }
});

httpServer.listen(3333, () => {
  console.log("server started on port 3333.");
});

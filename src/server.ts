import express from "express";
import cors from "cors";
import { server, app } from "./app";
import { io } from "./ws";
import { router } from "./routes";
import { prismaClient } from "./database/prismaClient";
import { createHash } from "crypto";

app.use(express.json());
app.use(router);
app.use(cors({ origin: "*" }));

io.on("connection", async (socket) => {
  try {
    const [id, token] = socket.handshake.headers.authorization?.split("|");

    const tokenDatabase = await prismaClient.personalAccessToken.findFirst({
      where: { id },
    });

    const tokenHash = createHash("sha256").update(token).digest("hex");

    const user = await prismaClient.user.findFirst({
      where: { id: tokenDatabase.tokenable_id },
    });

    socket["user"] = user;

    if (tokenHash === tokenDatabase.token) {
      console.log(`client connected: ${socket.id}, user: ${user.name}`);

      await prismaClient.user.update({
        where: { id: user.id },
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
          console.log(
            `user ${socket.user.id} not connected on chat ${chatId}.`
          );
        }
      });

      socket.on("message", (e) => {
        console.log({ e });

        io.emit("message", { message: e, name: user.name });
      });
    } else {
      socket.disconnect();
    }

    socket.on("disconnect", async (reason) => {
      console.log(`client disconnected: ${socket.id} // ${reason}`);
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

server.listen(3333, () => {
  console.log("server started on port 3333.");
});

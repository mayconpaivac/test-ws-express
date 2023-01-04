import { NextFunction } from "express";
import { Socket } from "socket.io";
import { createHash } from "crypto";
import { prismaClient } from "../database/prismaClient";

export const verifyToken = async (socket: Socket, next: NextFunction) => {
  const [id, token] = socket.handshake.headers.authorization?.split("|");

  const tokenDatabase = await prismaClient.personalAccessToken.findFirst({
    where: { id },
  });

  const tokenHash = createHash("sha256").update(token).digest("hex");

  const user = await prismaClient.user.findFirst({
    where: { id: tokenDatabase.tokenable_id },
  });

  if (tokenHash === tokenDatabase.token) {
    socket.user = user;

    console.log(
      `> Client connected: ${socket.id}, user id: ${socket.user?.id}`
    );

    next();
  } else {
    socket.disconnect();
    console.log(`> Token: ${token} not authenticated in socket ${socket.id}.`);
    next(new Error(`> Token: ${token} not authenticated.`));
  }
};

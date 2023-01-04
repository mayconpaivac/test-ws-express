import { Socket } from "socket.io";

type ISocket = {
  user?: {
    id: string;
    name: string;
    email: string;
    online: boolean;
  };
};

declare module "socket.io" {
  export interface Socket extends ISocket {}
}

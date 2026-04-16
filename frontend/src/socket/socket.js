import { io } from "socket.io-client";

export function createSocket() {
  return io("https://bluechat-6pue.onrender.com/api", { transports: ["websocket"] });
}


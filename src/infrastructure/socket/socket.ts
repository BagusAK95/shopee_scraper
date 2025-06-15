import http from "http";
import { Server, Socket } from "socket.io";
import { Mutex } from "async-mutex";

interface MessageRequest {
  shopId: string;
  itemId: string;
  resolve: (data: any) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

interface MessageResponse {
  shopId: string;
  itemId: string;
  data: any;
}

interface SocketClient {
  socket: Socket;
  state: 'idle' | 'busy';
}

export default class SocketServer {
  private io: Server;
  private clients: Map<string, SocketClient>;
  private requests: Map<string, MessageRequest>;
  private mutex: Mutex;

  constructor(server: http.Server) {
    this.io = new Server(server, { cors: { origin: '*' } });
    this.clients = new Map();
    this.requests = new Map();
    this.mutex = new Mutex();
  }

  listen() {
    this.io.use((socket, next) => {
      const uuid = socket.handshake.auth.uuid;
      socket.data.uuid = uuid;
      next();
    });

    this.io.on("connection", (socket: Socket) => {      
      const client = this.clients.get(socket.data.uuid);
      if (client) {
        console.log("🟢 Socket.io client reconnected:", socket.data.uuid);
        this.clients.set(socket.data.uuid, { socket, state: client.state });
      } else {
        console.log("🟢 Socket.io client connected:", socket.data.uuid);
        this.clients.set(socket.data.uuid, { socket, state: 'idle' });
      }

      socket.on("shopee_product_detail_response", (payload: MessageResponse) => {
        const { shopId, itemId, data } = payload;
        const key = `${shopId}_${itemId}`;
        console.log("💌 Socket.io received message: shopee_product_detail_response", key);

        const req = this.requests.get(key);
        if (req) {
          clearTimeout(req.timeout);
          req.resolve(data);
          this.requests.delete(key);
        }

        // random timeout between 1-3 seconds
        const randomTimeout = Math.floor(Math.random() * 2000) + 1000;
        setTimeout(() => {
          this.clients.set(socket.data.uuid, { socket, state: 'idle' });
        }, randomTimeout);
      });

      // socket.on("disconnect", () => {
      //   console.log("🔴 Socket.io client disconnected:", socket.data.uuid);
      //   this.clients.delete(socket.data.uuid);
      // });

      socket.on("error", (err: Error) => {
        console.error("❌ Socket.io error:", err);
      });
    });
  }

  async sendRequest(shopId: string, itemId: string) {
    await this.mutex.waitForUnlock();
    let socket: Socket | null = null;

    const release = await this.mutex.acquire();
    try {
      for (const [id, client] of this.clients.entries()) {
        if (client.state === 'busy') {
          continue;
        }

        socket = client.socket;
        if (socket) {
          socket.emit("shopee_product_detail_request", { shopId, itemId });
          this.clients.set(id, { socket, state: 'busy' });
          break;
        }
      }
    } finally {
      release();

      if (!socket) {
        setTimeout(() => {
          this.sendRequest(shopId, itemId)
        }, 3000); // 3s timeout
      }
    }
  }

  addRequest(key: string, req: MessageRequest) {
    this.requests.set(key, req);
  }

  removeRequest(key: string) {
    this.requests.delete(key);
  }
}
import http from "http";
import { Server, Socket } from "socket.io";

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

export class SocketServer {
  private io: Server;
  private clients: Map<string, SocketClient>;
  private requests: Map<string, MessageRequest>;

  constructor(server: http.Server) {
    this.io = new Server(server, { cors: { origin: '*' } });
    this.clients = new Map();
    this.requests = new Map();
  }

  listen() {
    this.io.on("connection", (socket: Socket) => {
      console.log("🟢 Socket.io client connected:", socket.id);
      this.clients.set(socket.id, { socket, state: 'idle' });

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

        this.clients.set(socket.id, { socket, state: 'idle' });
      });

      socket.on("disconnect", () => {
        console.log("🔴 Socket.io client disconnected:", socket.id);
        this.clients.delete(socket.id);
      });

      socket.on("error", (err: Error) => {
        console.error("❌ Socket.io error:", err);
      });
    });
  }

  sendRequest(shopId: string, itemId: string): string | null {
    for (const [id, client] of this.clients.entries()) {
      if (client.state === 'busy') {
        continue;
      }

      const socket = client.socket;
      if (socket) {
        socket.emit("shopee_product_detail_request", { shopId, itemId });
        this.clients.set(id, { socket, state: 'busy' });
        return id;
      }
    }

    return null;
  }

  addRequest(key: string, req: MessageRequest) {
    this.requests.set(key, req);
  }

  removeRequest(key: string) {
    this.requests.delete(key);
  }
}
import http from "http";
import WebSocket from "ws";

type ShopeeRequest = {
  shopId: string;
  itemId: string;
  resolve: (data: any) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
};

export var client: WebSocket | null;
export var requests: Map<string, ShopeeRequest>;

export class WebSocketServer {
  private server: http.Server;
  
  constructor(server: http.Server) {
    this.server = server;
    client = null;
    requests = new Map();
  }

  async listen() {
    const wss = new WebSocket.Server({ server: this.server });

    wss.on("connection", (ws: WebSocket) => {
      console.log("🟢 Client connected");
      client = ws;

      ws.on("message", (message: WebSocket.Data) => {
        try {
          const payload = JSON.parse(message.toString());
          const { shopId, itemId, data } = payload;
          const key = `${shopId}_${itemId}`;

          console.log("💌 Message received: Shopee Product Detail ", key);

          const req = requests.get(key);
          if (req) {
            clearTimeout(req.timeout);
            req.resolve(data);
            requests.delete(key);
          }
        } catch (err) {
          console.error("❌ Error handling message:", err);
        }
      });

      ws.on("close", () => {
        console.log("🔴 Client disconnected");
        // client = null;
      });

      ws.on("error", (err: Error) => {
        console.error("❌ WebSocket error:", err);
      });
    });
  }
}

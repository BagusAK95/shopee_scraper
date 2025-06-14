import createError from "http-errors";
import { SocketServer } from "../infrastructure/socket/socket";

export default class ShopeeService {
  private socket: SocketServer;

  constructor(socket: SocketServer) {
    this.socket = socket;
  }

  async getProduct(shopId: string, itemId: string) {
    try {
      const response = await this.sendRequest(shopId, itemId);
      return response;
    } catch (error: any) {
      throw createError(error.statusCode || 500, error.message);
    }
  }

  async sendRequest(shopId: string, itemId: string) {
    return new Promise((resolve, reject) => {
      const key = `${shopId}_${itemId}`;
      const timeout = setTimeout(() => {
        this.socket.removeRequest(key);
        reject(new Error("Timeout waiting for response"));
      }, 10000); // 10s timeout

      this.socket.addRequest(key, {
        shopId,
        itemId,
        resolve,
        reject,
        timeout,
      });

      this.socket.sendRequest(shopId, itemId);
    }).catch(() => {
      throw createError.GatewayTimeout("Timeout waiting for response");
    });
  }
}
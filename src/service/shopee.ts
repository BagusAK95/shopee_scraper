import createError from "http-errors";
import { client, requests } from "../infrastructure/wss/wss";

export default class ShopeeService {
  async getProduct(shopId: string, itemId: string) {
    try {
      if (!client || client.readyState !== WebSocket.OPEN) {
        throw createError.Forbidden("Client not connected");
      }

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
        requests.delete(key);
        reject(new Error("Timeout waiting for response"));
      }, 10000); // 10s timeout

      requests.set(key, {
        shopId,
        itemId,
        resolve,
        reject,
        timeout,
      });

      client?.send(JSON.stringify({ shopId, itemId }));
    }).catch(() => {
      throw createError.GatewayTimeout("Timeout waiting for response");
    });
  }
}

import { validationResult } from 'express-validator';
import ShopeeService from '../service/shopee';

export default class ShopeeController {
  private service: ShopeeService;

  constructor() {
    this.service = new ShopeeService();
  }

  /**
   * GET /api/shopee
   * ---------------------
   * Get detail product.
   *
   * Optional Query Parameters:
   * - shopId: Shop ID
   * - itemId: Item ID
   *
   * Success Response:
   * - 200 OK: Returns a product detail.
   *
   * Error Response:
   * - 400 Bad Request: Returned if an invalid shopId or itemId value is provided.
   */
  async getProduct(req: any, res: any) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    try {
      const { shopId, itemId } = req.query;
      const response = await this.service.getProduct(shopId, itemId);

      return res.status(200).json(response);
    } catch (error: any) {
      return res.status(error.statusCode).json({ message: error.message });
    }
  }
}
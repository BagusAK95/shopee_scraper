import { Router } from "express";
import { validateGetProduct } from "../utils/validator/shopee";
import ShopeeController from "../controller/shopee";

class ShopeeRouter {
  private router: Router;
  private controller: ShopeeController;

  constructor() {
    this.router = Router();
    this.controller = new ShopeeController();

    this.init();
  }

  init() {
    this.router.get("/", validateGetProduct, this.getProduct.bind(this));
  }

  getProduct(req: any, res: any) {
    this.controller.getProduct(req, res);
  }

  getRouter() {
    return this.router;
  }
}

export default new ShopeeRouter().getRouter();

import { Router } from "express";
import { validateGetProduct } from "../utils/validator/shopee";
import ShopeeController from "../controller/shopee";
import { SocketServer } from "../infrastructure/socket/socket";

export default class ShopeeRouter {
  private router: Router;
  private controller: ShopeeController;

  constructor(socket: SocketServer) {
    this.router = Router();
    this.controller = new ShopeeController(socket);

    this.init();
  }

  init(): Router {
    this.router.get("/", validateGetProduct, this.getProduct.bind(this));
    return this.router;
  }

  getProduct(req: any, res: any) {
    this.controller.getProduct(req, res);
  }
}

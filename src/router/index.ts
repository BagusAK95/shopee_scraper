import { Router } from "express";
import ShopeeRouter from "./shopee";

const router = Router();
router.use("/shopee", ShopeeRouter);

export default router;
import { Router as ExpressRouter } from "express";
import ShopeeRouter from "./shopee";
import { SocketServer } from "../infrastructure/socket/socket";

export class Router {
    private socket: SocketServer;
    
    constructor(socket: SocketServer) {
        this.socket = socket;
    }

    init(): ExpressRouter {
        const router = ExpressRouter();
        router.use("/shopee", new ShopeeRouter(this.socket).init());
        
        return router;
    }
}
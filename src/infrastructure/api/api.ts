import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { rateLimiter } from '../../utils/limiter/limiter';

export default class ApiServer {
	init(): express.Express {
    const app = express();
    
    // Middleware setup
    app.use(rateLimiter);
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cors());

    return app;
  }
}
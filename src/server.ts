// Core modules and third-party dependencies
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './router';
import http from 'http';
import { WebSocketServer } from './infrastructure/wss/wss';
import { rateLimiter } from './utils/limiter/limiter';

const app = express();

// Middleware setup
app.use(rateLimiter);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const server = http.createServer(app);
const wss = new WebSocketServer(server);
wss.listen();

// API routes
app.use('/', router);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
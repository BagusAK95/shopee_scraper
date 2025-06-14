// Core modules and third-party dependencies
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import { SocketServer } from './infrastructure/socket/socket';
import { rateLimiter } from './utils/limiter/limiter';
import { Router } from './router';

const app = express();

// Middleware setup
app.use(rateLimiter);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Socket.io server
const server = http.createServer(app);
const socket = new SocketServer(server);
socket.listen();

// API routes
const router = new Router(socket);
app.use('/', router.init());

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
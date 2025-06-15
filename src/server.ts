import ApiServer from './infrastructure/api/api';
import SocketServer from './infrastructure/socket/socket';
import { Router } from './router';
import http from 'http';

// API server
const app = new ApiServer();
const api = app.init();

// Socket.io server
const server = http.createServer(api);
const socket = new SocketServer(server);
socket.listen();

// API routes
const router = new Router(socket);
api.use('/', router.init());

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});

// 1. retry mechanism
// 2. random timeout
// 3. scalable

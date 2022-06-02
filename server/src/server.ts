import 'dotenv/config';
import http from 'http';
import { Server, ServerOptions } from 'socket.io';

import web from './web';
import { setupServer } from './socket';
import logger from './utils/logger.util';

//It has to be set to disable default pooling transport
const ioSettings: Partial<ServerOptions> = {
  transports: ['websocket'],
};

if (process.env.CORS) {
  ioSettings.cors = {
    origin: process.env.CORS,
    methods: ['GET', 'POST'],
  };
}

const httpServer = http.createServer(web);
const socketServer = new Server(httpServer, ioSettings);

setupServer(socketServer);
httpServer.listen(process.env.PORT);

logger('Server running at port:', process.env.PORT);

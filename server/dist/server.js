"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const web_1 = __importDefault(require("./web"));
const socket_1 = require("./socket");
const logger_util_1 = __importDefault(require("./utils/logger.util"));
//It has to be set to disable default pooling transport
const ioSettings = {
    transports: ['websocket'],
};
if (process.env.CORS) {
    ioSettings.cors = {
        origin: process.env.CORS,
        methods: ['GET', 'POST'],
    };
}
const httpServer = http_1.default.createServer(web_1.default);
const socketServer = new socket_io_1.Server(httpServer, ioSettings);
(0, socket_1.setupServer)(socketServer);
httpServer.listen(process.env.PORT);
(0, logger_util_1.default)('Server running at port:', process.env.PORT);

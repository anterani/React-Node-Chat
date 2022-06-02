"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = (...msg) => {
    //.env is loaded in server.ts
    if (process.env.LOG?.toLowerCase() === 'true') {
        console.log(msg.join(' '));
    }
};
exports.default = logger;

import { Server } from 'socket.io';
import { RateLimiter } from 'limiter';
import logger from './utils/logger.util';

type ClientType = {
  name: string;
  room: string;
};

//all callbacks use that type
type CallbackType = ({ status, message }: { status: boolean; message?: string }) => void;

const validateClient = ({ name, room }: ClientType): boolean => {
  return [name, room].every((item) => {
    if (typeof item === 'string' && /^[a-zA-Z0-9]{3,20}$/.test(item)) {
      return true;
    }

    return false;
  });
};

const validateMessage = (message: any): boolean => {
  if (typeof message === 'string' && message.length >= 1 && message.length <= 100) {
    return true;
  }

  return false;
};

const removeClientFromRoom = (clientData: ClientType) => {
  const clientIndex = rooms[clientData.room].indexOf(clientData.name);
  rooms[clientData.room].splice(clientIndex, 1);
};

//rooms array that contains client array of client names
const rooms: { [key: string]: string[] } = {};

const setupServer = (io: Server) => {
  io.on('connection', (socket) => {
    //It's null until client join room
    let client: null | ClientType = null;

    const messageLimiter = new RateLimiter({
      tokensPerInterval: 3,
      interval: 2000,
    });

    logger(`client ${socket.id} is connecting from ${socket.handshake.address}`);

    socket.on('join', (data: ClientType, callback: CallbackType) => {
      //check if client already joined room
      if (client) {
        callback({ status: false, message: 'you already joined room' });
        return;
      }
      if (!validateClient(data)) {
        callback({ status: false, message: 'name and/or room are incorrect' });
        return;
      }

      /* If room not exist, then create new one and assign array with client name to it.
         If room exist, then check if name is available and add client to room 
         or reject join if it was already taken.  */
      if (!rooms[data.room]) {
        rooms[data.room] = [data.name];
      } else {
        if (rooms[data.room].includes(data.name)) {
          callback({ status: false, message: 'name already taken' });
          return;
        }

        rooms[data.room].push(data.name);
      }

      client = data;
      socket.join(client.room);

      callback({ status: true });
      logger(`client ${socket.id} joined room ${data.room} as ${data.name}`);
    });

    socket.on('leave', (callback: CallbackType) => {
      //check if client joined room
      if (!client) {
        return;
      }

      logger(`client ${socket.id} is leaving room ${client.room}`);

      socket.leave(client.room);
      removeClientFromRoom(client);

      client = null;
      callback({ status: true });
    });

    socket.on('message', (msg: string) => {
      //client needs to be in room and message must be valid
      if (!client || !validateMessage(msg)) {
        return;
      }

      //SPAM PROTECTION
      if (messageLimiter.tryRemoveTokens(1)) {
        io.to(client.room).emit('message', {
          from: client.name,
          body: msg.trim(),
        });

        logger(`client ${socket.id} send message as ${client.name} to room ${client.room}`);
      } else {
        logger(`client ${socket.id} triggered spam protection`);
        socket.emit('spam-protection');
      }
    });

    socket.on('disconnect', () => {
      //remove client from rooms if he joined one
      if (client) {
        removeClientFromRoom(client);
      }

      logger(`client ${socket.id} disconnected`);
    });
  });
};

export { setupServer };

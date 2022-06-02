import { Server, Socket } from 'socket.io';

type ResponseType = {
  status: boolean;
  message?: string;
};

class SocketMock {
  public mockSocket: Socket;
  public mockSocketEvents: { event: string; callback: (...args: any[]) => void }[] = [];

  constructor(address: string) {
    this.mockSocket = Object.assign(jest.createMockFromModule<Socket>('socket.io'), {
      handshake: { address }, //must be set for one of the logs
      on: (event: any, callback: any) => this.mockSocketEvents.push({ event, callback }),
      emit: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
    }) as Socket;
  }

  getEventByName(name: string) {
    return this.mockSocketEvents.find((mockEvent) => {
      if (mockEvent.event === name) {
        return true;
      }
      return false;
    });
  }
}

class ServerMock {
  public mockServer: Server;
  public mockOnConnection: (client: Socket) => void = () => {};
  public mockEmitEvent = jest.fn();

  constructor(setup: (io: Server) => void) {
    this.mockServer = Object.assign(jest.createMockFromModule<Server>('socket.io'), {
      on: (_: any, callback: any) => (this.mockOnConnection = callback),
      to: jest.fn(() => ({ emit: this.mockEmitEvent })),
    }) as Server;

    //bind socket.ts logic
    setup(this.mockServer);
  }
}

describe('socket', () => {
  let server: ServerMock;
  let client: SocketMock;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetModules();

    server = new ServerMock((await import('./socket')).setupServer);
    client = new SocketMock('192.168.0.5');
    server.mockOnConnection(client.mockSocket); //connection
  });

  it('should handle new connection', () => {
    expect(client.mockSocketEvents.length).toBeGreaterThan(0);
  });

  it('should allow join with valid data', (done) => {
    const mockJoinEvent = client.getEventByName('join');
    mockJoinEvent?.callback({ name: 'TestName', room: 'TestRoom' }, ({ status }: ResponseType) => {
      expect(status).toBe(true);
      done();
    });
  });

  it('should reject join if data is invalid', (done) => {
    client
      .getEventByName('join')
      ?.callback({ name: 'Test Name', room: 'Test@Room' }, ({ status, message }: ResponseType) => {
        expect(status).toBe(false);
        expect(message).toBe('name and/or room are incorrect');

        done();
      });
  });

  it('should reject join if already joined', (done) => {
    client.getEventByName('join')?.callback({ name: 'TestName', room: 'TestRoom' }, () => {
      client
        .getEventByName('join')
        ?.callback({ name: 'OtherName', room: 'OtherRoom' }, ({ status, message }: ResponseType) => {
          expect(status).toBe(false);
          expect(message).toBe('you already joined room');

          done();
        });
    });
  });

  it('should reject join if name is already taken', (done) => {
    const otherClient = new SocketMock('192.168.0.15');
    server.mockOnConnection(otherClient.mockSocket);

    otherClient.getEventByName('join')?.callback({ name: 'TestName', room: 'TestRoom' }, () => {
      client
        .getEventByName('join')
        ?.callback({ name: 'TestName', room: 'TestRoom' }, ({ status, message }: ResponseType) => {
          expect(status).toBe(false);
          expect(message).toBe('name already taken');

          done();
        });
    });
  });

  it('should allow to join room if name is available', (done) => {
    const otherClient = new SocketMock('192.168.0.15');
    server.mockOnConnection(otherClient.mockSocket);

    otherClient.getEventByName('join')?.callback({ name: 'OtherName', room: 'TestRoom' }, () => {
      client.getEventByName('join')?.callback({ name: 'TestName', room: 'TestRoom' }, ({ status }: ResponseType) => {
        expect(status).toBe(true);
        done();
      });
    });
  });

  it('should handle leave event', (done) => {
    client.getEventByName('join')?.callback({ name: 'TestName', room: 'TestRoom' }, () => {
      client.getEventByName('leave')?.callback(({ status }: ResponseType) => {
        expect(status).toBe(true);
        done();
      });
    });
  });

  it('should reject leave if not in room', () => {
    client.getEventByName('leave')?.callback();
    expect(client.mockSocket.leave).not.toBeCalled();
  });

  it('should send valid message', (done) => {
    client.getEventByName('join')?.callback({ name: 'TestName', room: 'TestRoom' }, () => {
      client.getEventByName('message')?.callback('Test Message');

      expect(server.mockServer.to).toBeCalledWith('TestRoom');
      expect(server.mockEmitEvent).toBeCalledWith('message', { from: 'TestName', body: 'Test Message' });

      done();
    });
  });

  it('should reject invalid message', (done) => {
    client.getEventByName('join')?.callback({ name: 'TestName', room: 'TestRoom' }, () => {
      client.getEventByName('message')?.callback(12345);

      expect(server.mockEmitEvent).not.toBeCalled();
      expect(server.mockServer.to).not.toBeCalled();

      done();
    });
  });

  it('should emit spam-protection if messages are sent too fast', (done) => {
    client.getEventByName('join')?.callback({ name: 'TestName', room: 'TestRoom' }, () => {
      ['message 1', 'message 2', 'message 3', 'message 4'].forEach((message) => {
        client.getEventByName('message')?.callback(message);
      }); //client is able to send 3 messages per 2 seconds before spam-protection triggers

      expect(server.mockEmitEvent).toBeCalledTimes(3);
      expect(server.mockEmitEvent).not.toBeCalledWith('message', { from: 'TestName', body: 'message 4' });
      expect(client.mockSocket.emit).toBeCalledWith('spam-protection');

      done();
    });
  });

  it('should handle disconnect', (done) => {
    client.getEventByName('join')?.callback({ name: 'TestName', room: 'TestRoom' }, () => {
      client.getEventByName('disconnect')?.callback();
      done();
    });
  });
});

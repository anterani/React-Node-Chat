const mockListen = jest.fn();
const mockSetup = jest.fn();

jest.mock('./web', () => {});
jest.mock('./socket', () => {
  return {
    setupServer: mockSetup,
  };
});
jest.mock('./utils/logger.util');
jest.mock('socket.io');
jest.mock('http', () => {
  return {
    createServer: jest.fn(() => {
      return {
        listen: mockListen,
      };
    }),
  };
});

describe('server', () => {
  it('should ', async () => {
    await import('./server');

    expect(mockSetup).toBeCalled();
    expect(mockListen).toBeCalledWith(process.env.PORT);
  });
});

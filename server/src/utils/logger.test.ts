import logger from './logger.util';

console.log = jest.fn();

describe('logger', () => {
  afterEach(() => {
    delete process.env.LOG;
    jest.resetAllMocks();
  });

  it('should not log if not enabled in environment', () => {
    logger('test', 'log');
    expect(console.log).not.toBeCalled();
  });

  it('should log if enabled in environment', () => {
    process.env.LOG = 'TRUE';
    logger('test', 'log');

    expect(console.log).toBeCalledWith('test log');
  });
});

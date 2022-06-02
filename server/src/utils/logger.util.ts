const logger = (...msg: any[]) => {
  //.env is loaded in server.ts
  if (process.env.LOG?.toLowerCase() === 'true') {
    console.log(msg.join(' '));
  }
};

export default logger;

import express from 'express';
import helmet from 'helmet';
import path from 'path';

const app = express();

app.use(helmet());
app.use(express.static('public'));

app.get('*', (_, res) => {
  res.sendFile(path.resolve('public', 'index.html'));
});

export default app;

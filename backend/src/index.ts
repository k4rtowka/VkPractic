import express from 'express';
import cors from 'cors';
import { config } from './config';
import { testConnection } from './db';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors({ origin: config.cors.origin }));
app.use(express.json());

app.use('/api', routes);

app.use(errorHandler);

async function start(): Promise<void> {
  const connected = await testConnection();
  if (!connected) {
    console.error('Не удалось подключиться к MySQL. Проверьте .env и что БД создана.');
    process.exit(1);
  }

  app.listen(config.port, () => {
    console.log(`Server: http://localhost:${config.port}`);
    console.log(`API: http://localhost:${config.port}/api`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

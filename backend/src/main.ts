import 'dotenv/config';
import { connectDB } from './config/database';
import { app } from './app';
import { logger } from './config/logger';

// Conectar a DB
connectDB();

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}/api`);
});
server.on('error', (err) => logger.error({ err }, 'Error en servidor HTTP'));

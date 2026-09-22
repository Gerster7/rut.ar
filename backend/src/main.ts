import 'dotenv/config';
import { connectDB } from './config/database';
import { app } from './app';

// Conectar a DB
connectDB();

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);

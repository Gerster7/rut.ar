import express from 'express';
import * as path from 'path';
import cors from 'cors';
import { connectDB } from './config/database';
import usuarioRoutes from './routes/usuario.routes';
import fleteroRoutes from './routes/fletero.routes';
import negocioRoutes from './routes/negocio.routes';
import viajeRoutes from './routes/viaje.routes';

const app = express();

// Middlewares importantes
app.use(cors());
app.use(express.json()); // Permite leer req.body en formato JSON

// Conectar a DB
connectDB();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Montar Rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/fleteros', fleteroRoutes);
app.use('/api/negocios', negocioRoutes);
app.use('/api/viajes', viajeRoutes);

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to backend!', oa: 'oaoa' });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);

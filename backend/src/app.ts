import 'dotenv/config';
import express from 'express';
import * as path from 'path';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { logger } from './config/logger';
import usuarioRoutes from './routes/usuario.routes';
import fleteroRoutes from './routes/fletero.routes';
import negocioRoutes from './routes/negocio.routes';
import viajeRoutes from './routes/viaje.routes';

export const app = express();

// Middlewares
app.use(pinoHttp({ logger }));
app.use(cors());
app.use(express.json());

app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Montar Rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/fleteros', fleteroRoutes);
app.use('/api/negocios', negocioRoutes);
app.use('/api/viajes', viajeRoutes);

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to backend!' });
});

export default app;

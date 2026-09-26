import { Sequelize } from 'sequelize-typescript';
import { dbModels } from '../models';
import { logger } from './logger';

export const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'rutar_db',
  username: process.env.DB_USER || 'rutar_user',
  password: process.env.DB_PASSWORD || 'rutar_password',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  port: Number(process.env.DB_PORT) || 3307, 
  models: dbModels, 
  logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 15000,
    idle: 5000,
  },
  dialectOptions: {
    connectTimeout: 10000,
  },
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Conexión a MySQL establecida correctamente vía Sequelize.');
    
    // Sincroniza los modelos con la base de datos (Crea las tablas)
    await sequelize.sync({ alter: true });
    logger.info('✅ Tablas sincronizadas con éxito.');
  } catch (error) {
    logger.error({ error }, '❌ Error conectando a MySQL:');
    process.exit(1);
  }
};

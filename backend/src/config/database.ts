import { Sequelize } from 'sequelize-typescript';
import { dbModels } from '../models';

export const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'rutar_db',
  username: process.env.DB_USER || 'rutar_user',
  password: process.env.DB_PASSWORD || 'rutar_password',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  port: Number(process.env.DB_PORT) || 3307, 
  models: dbModels, 
  logging: process.env.NODE_ENV === 'development' ? console.log : false, 
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida correctamente vía Sequelize.');
    
    // Sincroniza los modelos con la base de datos (Crea las tablas)
    await sequelize.sync({ alter: true });
    console.log('✅ Tablas sincronizadas con éxito.');
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error);
    process.exit(1);
  }
};

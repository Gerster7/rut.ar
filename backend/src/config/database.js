import { Sequelize } from 'sequelize-typescript';
import { dbModels } from '../models';
export const sequelize = new Sequelize({
    database: 'rutar_db',
    username: 'rutar_user',
    password: 'rutar_password',
    host: 'localhost',
    dialect: 'mysql',
    port: 3307,
    models: dbModels,
    logging: /*false*/ console.log,
});
export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a MySQL establecida correctamente vía Sequelize.');
        // Sincroniza los modelos con la base de datos (Crea las tablas)
        await sequelize.sync({ alter: true });
        console.log('✅ Tablas sincronizadas con éxito.');
    }
    catch (error) {
        console.error('❌ Error conectando a MySQL:', error);
        process.exit(1);
    }
};

import { connectDB, sequelize } from './config/database';
import { Usuario, Fletero, Negocio } from './models';
import * as bcrypt from 'bcrypt';

async function seed() {
  await connectDB();
  
  // Opcional: Sincronizar (forzar reinicio de BD si se desea limpiar antes)
  // await sequelize.sync({ force: true });
  
  const defaultPassword = await bcrypt.hash('Prueba123', 10);

  console.log('🌱 Creando Usuarios...');
  const userAdmin = await Usuario.create({ email: 'admin@rutar.com', password: defaultPassword, rol: 'ADMINISTRADOR' });
  const userLogistico = await Usuario.create({ email: 'logistico@rutar.com', password: defaultPassword, rol: 'LOGISTICO' });
  const userFletero1 = await Usuario.create({ email: 'fletero1@rutar.com', password: defaultPassword, rol: 'FLETERO' });
  const userFletero2 = await Usuario.create({ email: 'fletero2@rutar.com', password: defaultPassword, rol: 'FLETERO' });

  console.log('🚚 Creando Fleteros con ubicaciones...');
  // Coordenadas aproximadas en Santa Fe / Rosario
  await Fletero.create({
    nombre: 'Juan Perez',
    telefono: '3411234567',
    vehiculo: 'Camión con Acoplado',
    patenteVehiculo: 'AA123BB',
    capacidadVehiculo: 30000,
    latitudActual: -32.9442, // Rosario
    longitudActual: -60.6505,
    usuarioId: userFletero1.id
  });

  await Fletero.create({
    nombre: 'Mario Gomez',
    telefono: '3429876543',
    vehiculo: 'Furgón',
    patenteVehiculo: 'AB987CC',
    capacidadVehiculo: 5000,
    latitudActual: -31.6107, // Santa Fe Capital
    longitudActual: -60.6973,
    usuarioId: userFletero2.id
  });

  console.log('📦 Creando Negocios (Cargas a transportar)...');
  await Negocio.create({
    descripcion: 'Carga de Soja',
    tipoCarga: 'Granos',
    estado: 'abierto',
    origenLat: -32.7455, // San Lorenzo (Puerto)
    origenLng: -60.7303,
    destinoLat: -31.2526, // Rafaela
    destinoLng: -61.4916,
    pesoTotal: 29000,
    usuarioId: userLogistico.id
  });

  await Negocio.create({
    descripcion: 'Pallets de Electrónica',
    tipoCarga: 'Paletizado',
    estado: 'abierto',
    origenLat: -32.9442, // Rosario
    origenLng: -60.6505,
    destinoLat: -34.6037, // CABA
    destinoLng: -58.3816,
    pesoTotal: 4500,
    usuarioId: userLogistico.id
  });

  console.log('✅ Base de datos poblada exitosamente.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Error al poblar la base de datos:', err);
  process.exit(1);
});

import { connectDB, sequelize } from './config/database';
import { Usuario, Fletero, Negocio, Viaje } from './models';
import * as bcrypt from 'bcrypt';

const locations = [
  { name: 'Rosario', lat: -32.9442, lng: -60.6505 },
  { name: 'Santa Fe', lat: -31.6107, lng: -60.6973 },
  { name: 'San Lorenzo', lat: -32.7455, lng: -60.7303 },
  { name: 'Rafaela', lat: -31.2526, lng: -61.4916 },
  { name: 'CABA', lat: -34.6037, lng: -58.3816 },
  { name: 'Córdoba', lat: -31.4201, lng: -64.1888 },
  { name: 'Mendoza', lat: -32.8908, lng: -68.8272 },
  { name: 'Tucumán', lat: -26.8083, lng: -65.2176 },
  { name: 'Neuquén', lat: -38.9516, lng: -68.0591 },
  { name: 'Salta', lat: -24.7821, lng: -65.4232 },
  { name: 'Corrientes', lat: -27.4692, lng: -58.8306 },
  { name: 'Bahía Blanca', lat: -38.7183, lng: -62.2663 },
  { name: 'Bariloche', lat: -41.1335, lng: -71.3103 },
  { name: 'Mar del Plata', lat: -38.0055, lng: -57.5426 },
  { name: 'Resistencia', lat: -27.4606, lng: -58.9839 }
];

const vehiculos = ['Camión con Acoplado', 'Furgón', 'Camioneta', 'Chasis', 'Utilitario'];
const cargas = ['Granos', 'Paletizado', 'Refrigerado', 'Maquinaria', 'Carga General', 'Líquidos', 'Materiales de Construcción'];

const getRandomLocation = () => locations[Math.floor(Math.random() * locations.length)];
const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seed() {
  await connectDB();
  
  // Sincronizar (forzar reinicio de BD para limpiar y cargar desde 0)
  console.log('⚠️ Sincronizando Base de Datos (Dropping tables)...');
  await sequelize.sync({ force: true });
  
  const defaultPassword = await bcrypt.hash('Prueba123', 10);

  console.log('🌱 Creando Usuarios (Admin y Logísticos)...');
  await Usuario.create({ email: 'admin@rutar.com', password: defaultPassword, rol: 'ADMINISTRADOR' });
  
  // 3 Logísticos
  const logistico1 = await Usuario.create({ email: 'logistico1@rutar.com', password: defaultPassword, rol: 'LOGISTICO' });
  const logistico2 = await Usuario.create({ email: 'logistico2@rutar.com', password: defaultPassword, rol: 'LOGISTICO' });
  const logistico3 = await Usuario.create({ email: 'logistico3@rutar.com', password: defaultPassword, rol: 'LOGISTICO' });
  const logisticos = [logistico1, logistico2, logistico3];

  console.log('🚚 Creando 10 Fleteros...');
  const fleteros: Fletero[] = [];
  for (let i = 1; i <= 10; i++) {
    const userFletero = await Usuario.create({ email: `fletero${i}@rutar.com`, password: defaultPassword, rol: 'FLETERO' });
    const loc = getRandomLocation();
    
    const fletero = await Fletero.create({
      nombre: `Fletero ${i}`,
      telefono: `11000000${i.toString().padStart(2, '0')}`,
      vehiculo: getRandomItem(vehiculos),
      patenteVehiculo: `AB123${String.fromCharCode(64 + i)}${String.fromCharCode(65 + i)}`,
      capacidadVehiculo: getRandomInt(1000, 30000), // En kg
      latitudActual: loc.lat,
      longitudActual: loc.lng,
      usuarioId: userFletero.id
    });
    fleteros.push(fletero);
  }

  console.log('📦 Creando 20 Negocios...');
  const negocios: Negocio[] = [];
  const negocioStates = ['abierto', 'asignado', 'completado'];
  
  for (let i = 1; i <= 20; i++) {
    const logistico = getRandomItem(logisticos);
    const origen = getRandomLocation();
    let destino = getRandomLocation();
    while (destino.name === origen.name) {
      destino = getRandomLocation();
    }

    const negocio = await Negocio.create({
      descripcion: `Carga de ${getRandomItem(cargas)} #${i}`,
      tipoCarga: getRandomItem(cargas),
      estado: getRandomItem(negocioStates),
      origenLat: origen.lat,
      origenLng: origen.lng,
      destinoLat: destino.lat,
      destinoLng: destino.lng,
      pesoTotal: getRandomInt(500, 25000),
      usuarioId: logistico.id
    });
    negocios.push(negocio);
  }

  console.log('🛣️ Creando 50 Viajes...');
  const viajeStates = ['abierto', 'asignado', 'en curso', 'finalizado'];
  
  for (let i = 1; i <= 50; i++) {
    const negocio = getRandomItem(negocios);
    const fletero = getRandomItem(fleteros);
    
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - getRandomInt(0, 30)); // Inició hace 0-30 días
    
    const fechaFinEstimada = new Date(fechaInicio);
    fechaFinEstimada.setDate(fechaFinEstimada.getDate() + getRandomInt(1, 5)); // Tarda 1-5 días

    await Viaje.create({
      negocioId: negocio.id,
      fleteroId: fletero.id,
      fechaInicio: fechaInicio,
      fechaFinEstimada: fechaFinEstimada,
      estado: getRandomItem(viajeStates),
      pesoAsignado: getRandomInt(100, negocio.pesoTotal)
    });
  }

  console.log('✅ Base de datos poblada exitosamente.');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Error al poblar la base de datos:', err);
  process.exit(1);
});

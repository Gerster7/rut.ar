const API_URL = 'http://localhost:3333/api';

async function seed() {
  console.log('🌱 Registrando Usuarios...');
  
  console.log('🔑 Haciendo Login como ADMIN para obtener token maestro...');
  const loginAdmin = await fetch(`${API_URL}/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@rutar.com', password: 'Prueba123' })
  });
  const { token: adminToken } = await loginAdmin.json();

  // 1. Registrar LOGISTICO
  let r1 = await fetch(`${API_URL}/usuarios/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ email: 'logistico@rutar.com', password: 'Prueba123', rol: 'LOGISTICO' })
  });
  console.log('Reg LOGISTICO:', await r1.text());

  // 2. Registrar FLETEROS
  let r2 = await fetch(`${API_URL}/usuarios/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fletero1@rutar.com', password: 'Prueba123', rol: 'FLETERO' })
  });
  console.log('Reg F1:', await r2.text());
  
  let r3 = await fetch(`${API_URL}/usuarios/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fletero2@rutar.com', password: 'Prueba123', rol: 'FLETERO' })
  });
  console.log('Reg F2:', await r3.text());

  console.log('🔑 Haciendo Login como LOGISTICO para obtener token...');
  const loginRes = await fetch(`${API_URL}/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'logistico@rutar.com', password: 'Prueba123' })
  });
  const loginJson = await loginRes.json();
  console.log('Login res:', loginJson);
  const { token, usuario: logisticoUser } = loginJson;
  
  if(!token) {
      console.error('Error al loguearse');
      process.exit(1);
  }

  // Login de los fleteros para obtener sus IDs
  const loginF1 = await fetch(`${API_URL}/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fletero1@rutar.com', password: 'Prueba123' })
  });
  const { usuario: userF1 } = await loginF1.json();

  const loginF2 = await fetch(`${API_URL}/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'fletero2@rutar.com', password: 'Prueba123' })
  });
  const { usuario: userF2 } = await loginF2.json();

  console.log('🚚 Creando Fleteros con ubicaciones...');
  // Para crear fleteros, usamos el token del logistico (o un admin) ya que tiene permisos
  await fetch(`${API_URL}/fleteros`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      nombre: 'Juan Perez',
      telefono: '3411234567',
      vehiculo: 'Camión con Acoplado',
      patenteVehiculo: 'AA123BB',
      capacidadVehiculo: 30000,
      latitudActual: -32.9442, // Rosario
      longitudActual: -60.6505,
      usuarioId: userF1.id
    })
  });

  await fetch(`${API_URL}/fleteros`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      nombre: 'Mario Gomez',
      telefono: '3429876543',
      vehiculo: 'Furgón',
      patenteVehiculo: 'AB987CC',
      capacidadVehiculo: 5000,
      latitudActual: -31.6107, // Santa Fe Capital
      longitudActual: -60.6973,
      usuarioId: userF2.id
    })
  });

  console.log('📦 Creando Negocios (Cargas a transportar)...');
  await fetch(`${API_URL}/negocios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      descripcion: 'Carga de Soja',
      tipoCarga: 'Granos',
      estado: 'abierto',
      origenLat: -32.7455, // San Lorenzo (Puerto)
      origenLng: -60.7303,
      destinoLat: -31.2526, // Rafaela
      destinoLng: -61.4916,
      pesoTotal: 29000,
      usuarioId: logisticoUser.id
    })
  });

  await fetch(`${API_URL}/negocios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      descripcion: 'Pallets de Electrónica',
      tipoCarga: 'Paletizado',
      estado: 'abierto',
      origenLat: -32.9442, // Rosario
      origenLng: -60.6505,
      destinoLat: -34.6037, // CABA
      destinoLng: -58.3816,
      pesoTotal: 4500,
      usuarioId: logisticoUser.id
    })
  });

  console.log('✅ Base de datos poblada exitosamente mediante la API.');
}

seed().catch(err => {
  console.error('❌ Error:', err);
});

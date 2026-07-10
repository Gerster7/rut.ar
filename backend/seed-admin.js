const mysql = require('mysql2/promise');

async function seedAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'rutar_user',
    password: 'rutar_password',
    database: 'rutar_db'
  });

  const hash = '$2b$10$DC5AP30sJ3V73rfxWBKKaO51n4aUCIRsCkmILYnzt.xdm1ON7E8oC';
  
  await connection.execute(
    'INSERT IGNORE INTO usuarios (email, password, rol, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
    ['admin@rutar.com', hash, 'ADMINISTRADOR']
  );

  console.log('Admin inyectado directo a BD.');
  await connection.end();
}

seedAdmin().catch(console.error);

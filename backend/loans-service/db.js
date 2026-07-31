const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'Act6',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

pool.on('connect', () => {
  console.log('🔗 Conectado a la base de datos (Loans Service)');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en la base de datos', err);
  process.exit(-1);
});

module.exports = pool;

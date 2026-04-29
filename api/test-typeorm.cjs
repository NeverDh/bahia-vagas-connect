// Teste de conexão TypeORM
require('reflect-metadata');
const { DataSource } = require('typeorm');

// Carregar variáveis do .env
const fs = require('fs');
const envFile = fs.readFileSync('./.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

console.log('DATABASE_URL:', env.DATABASE_URL ? '✓ Configurada' : '✗ NÃO CONFIGURADA');

const dataSource = new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  entities: [require('./dist/entities/job.entity.js')],
  synchronize: true,
  logging: true,
});

dataSource.initialize()
  .then(() => {
    console.log('✅ TypeORM: CONECTADO!');
    return dataSource.query('SELECT version()');
  })
  .then(res => {
    console.log('PostgreSQL:', res[0].version);
    dataSource.destroy();
  })
  .catch(err => {
    console.error('❌ TypeORM:', err.message);
    dataSource.destroy();
  });
const { Client } = require('pg');

// Teste com Session mode (porta 5432) - necessário para TypeORM synchronize
const client = new Client({
  host: 'aws-1-sa-east-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.gfzzmjnjpgxppudzhcyy',
  password: 'lgss240520@@',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

client.connect()
  .then(() => {
    console.log('✅ Session mode (5432): CONNECTED!');
    return client.query('SELECT version()');
  })
  .then(res => {
    console.log('PostgreSQL:', res.rows[0].version);
    client.end();
  })
  .catch(err => {
    console.error('❌ Session mode (5432):', err.message);
    client.end();
  });

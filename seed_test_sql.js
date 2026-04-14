require('dotenv').config();
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});
async function run() {
  await client.connect();
  await client.query(`
    INSERT INTO admins (id, name, email, username, password_hash, updated_at) 
    VALUES ('admin-1', 'Test Admin', 'admin@test.com', 'admin', 'hash', NOW())
    ON CONFLICT DO NOTHING;
  `);

  await client.query(`
    INSERT INTO auctions (id, created_by, name, auction_type, status, updated_at) 
    VALUES ('12345', 'admin-1', 'Auction 1', 'ENGLISH', 'PENDING', NOW())
    ON CONFLICT DO NOTHING;
  `);

  await client.query(`
    INSERT INTO auctions (id, created_by, name, auction_type, status, updated_at) 
    VALUES ('67890', 'admin-1', 'Auction 2', 'DRAFT', 'PENDING', NOW())
    ON CONFLICT DO NOTHING;
  `);
  
  console.log('Seeded DB with Auctions using pg');
  await client.end();
}
run().catch(console.error);

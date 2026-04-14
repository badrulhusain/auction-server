require('dotenv').config();
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});
async function run() {
  await client.connect();
  const res = await client.query(`DELETE FROM students;`);
  console.log(`Deleted ${res.rowCount} rows from students table to allow migration`);
  await client.end();
}
run().catch(console.error);

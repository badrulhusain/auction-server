require('dotenv').config();
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});
async function run() {
  await client.connect();
  const res = await client.query(`
    DELETE FROM students a USING students b 
    WHERE a.id > b.id AND a.reg_no = b.reg_no;
  `);
  console.log(`Deleted ${res.rowCount} duplicate students by reg_no`);
  await client.end();
}
run().catch(console.error);

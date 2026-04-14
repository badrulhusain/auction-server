require('dotenv').config();
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});
async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT student_id, group_id, COUNT(*) 
    FROM student_groups 
    GROUP BY student_id, group_id 
    HAVING COUNT(*) > 1;
  `);
  console.log(`Found ${res.rowCount} duplicate student_groups`);
  
  if (res.rowCount > 0) {
    const resDelete = await client.query(`
      DELETE FROM student_groups a USING student_groups b 
      WHERE a.id > b.id AND a.student_id = b.student_id AND a.group_id = b.group_id;
    `);
    console.log(`Deleted ${resDelete.rowCount} duplicate student_groups`);
  }
  await client.end();
}
run().catch(console.error);

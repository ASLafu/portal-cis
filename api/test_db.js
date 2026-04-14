const mysql = require('mysql2/promise');

async function test() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cis_madrid'
  });
  
  try {
    const [usuarios] = await pool.query('SELECT * FROM usuarios');
    console.log("Usuarios:", usuarios);
    
    const [profesionales] = await pool.query('SELECT * FROM profesionales');
    console.log("Profesionales:", profesionales.map(p => p.email));
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

test();
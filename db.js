let mysql = null;
try {
  mysql = require('mysql2/promise');
} catch (err) {
  // mysql2 module not installed yet (run 'npm install')
}

let pool = null;
if (mysql) {
  pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'auction_user',
    password: process.env.DB_PASSWORD || 'AuctionPass123!',
    database: process.env.DB_NAME || 'auction_society',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true
  });
}

let isConnected = false;

async function checkConnection() {
  if (!pool) {
    isConnected = false;
    console.warn('[DB] Notice: mysql2 package is not installed. Run "npm install" to enable MySQL database connection.');
    return false;
  }
  try {
    const [rows] = await pool.query('SELECT 1 AS ok, DATABASE() as db');
    isConnected = true;
    console.log(`[DB] Connected successfully to MySQL database: ${rows[0].db}`);
    return true;
  } catch (err) {
    isConnected = false;
    console.error(`[DB] Connection failed: ${err.message}`);
    return false;
  }
}

module.exports = {
  pool,
  checkConnection,
  get isConnected() { return isConnected; }
};

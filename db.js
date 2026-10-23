const mysql = require('mysql2/promise');

const pool = mysql.createPool({
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

let isConnected = false;

async function checkConnection() {
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

const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  // Store and read database timestamps as UTC. Clients convert ISO timestamps to local time.
  timezone: 'Z'
});

module.exports = db;

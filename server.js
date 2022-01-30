require('dotenv').config();
const mysql = require('mysql2');

const dbOptions = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.PORT,
};

const db = mysql.createConnection(dbOptions);
console.log('Connected to the business_db database.');

module.exports = db;

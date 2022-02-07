require('dotenv').config();
const mysql = require('mysql2');

const dbOptions = {
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.PORT,
};

const db = mysql.createConnection(dbOptions);
console.log('Connected to the business_db database.');

// db.connect((err) => {
//   if (err) throw err;
//   console.log('connected to db');
// });

module.exports = db;

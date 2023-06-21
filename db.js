/** Database connection for messagely. */

const { Client } = require("pg");
const { DB_NAME } = require("./config");

let client = new Client({
    host: "/tmp",
    database: DB_NAME
  });

// and this is WSL2
// let client = new Client({
//   host: "/var/run/postgresql/",
//   database: DB_NAME,
// });

client.connect();

module.exports = client;

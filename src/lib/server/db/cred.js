"use strict";
exports.__esModule = true;
exports.post = void 0;
var pg_1 = require("pg");
var Client = pg_1["default"].Client;
// DISCLAIMER - This is handled server side with SHA3-512 passwords, not used.
exports.post = new Client({
    host: "172.105.106.183",
    user: "nick",
    port: 5432,
    password: "admin",
    database: "trx-data"
});

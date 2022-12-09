
import pkg from 'pg'
const { Client } = pkg;
// DISCLAIMER - This is handled server side with SHA3-512 passwords, not used.
export const post = new Client({
    host: "192.53.123.185",
    user: "nick",
    port: 5432,
    password: "admin",
    database: "trx-data"
})

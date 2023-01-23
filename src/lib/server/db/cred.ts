
import pkg from 'pg'
const { Client } = pkg;
// DISCLAIMER - This is handled server side with SHA3-512 passwords, not used.
export const post = new Client({
    host: "172.105.106.183",
    user: "nick",
    port: 5432,
    password: "admin",
    database: "trx-data"
})


import pkg from 'pg'
const { Client } = pkg;
// DISCLAIMER - This is handled server side with SHA3-512 passwords, not used.
export const post = new Client({
    host: "146.190.244.186",
    user: "nick",
    port: 5432,
    password: "admin",
    database: "trx-data"
})

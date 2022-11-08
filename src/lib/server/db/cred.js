
import pkg from 'pg'
const { Client } = pkg;

export const post = new Client({
    host: "172.105.106.183",
    user: "nick",
    port: 5432,
    password: "admin",
    database: "trx-data"
})

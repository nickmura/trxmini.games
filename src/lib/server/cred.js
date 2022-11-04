
import pkg from 'pg'
const { Client } = pkg;

export const post = new Client({
    host: "localhost",
    user: "nick",
    port: 5432,
    password: "8151",
    database: "trx-data"
})

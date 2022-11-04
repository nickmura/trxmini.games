
import pkg from 'pg'
const { Client } = pkg;

export const post = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "admin",
    database: "trx-names"
})

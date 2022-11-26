//@ts-nocheck
// THIS IS SOLELY CONFIGURATION AND ENDPOINTS FOR FOR USERNAMES VIA POSTGRES

import { post } from './cred.js'
import express, { query } from 'express';
import cors from 'cors';


post.connect();
const app = express();

app.use(express.urlencoded({ extended: true }))
app.use(express.json());

const whitelist = ['https://test2.trxmini.games', '//test2.trxmini.games', 'https://trxmini.games', 
'//trxmini.games', 'http://localhost:5173', '//localhost:5173', 'http://localhost:5500', '*']
const config = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) callback(null, true)
        else callback(new Error(`CORS Policy denied, origin is unexpected origin ${origin}`))
    }
}
app.use(cors(config))

let rooms 

app.post('/address', async (req, res) => {
    let user = req.body

    let insert = `insert into usernames("address") values($1)`
    const values = [`${user.address}`]
    await post.query(insert, values, (err, result) => {
        if (!err) console.log('Insertion was successful')
    })
    let update = `UPDATE usernames SET games_played=0,has_played=false,games_won=0 WHERE address=($1)`
    const values = [`${user.address}`]
    await post.query(update, values, (err, result) => {
        if (!err) console.log('Updated values was successful (games_played, has_played, games_won)')
    })
})

app.get('/gameplayed', async (req, res) => {
    let user = req.query.addr
    let insert 
    let values
    console.log(user)
    if (user) {
        insert = `UPDATE usernames SET games_played=games_played+1,has_played=true WHERE address=($1)`
        values = [`${user}`]
    } else {
        insert = `UPDATE usernames SET games_played=games_played+1,has_played=true WHERE username=($1)`
        values = [`${user.name}`]
    }
    post.query(insert, values, (err, result) => {
        if (!err) { 
            console.log('Game played set to player', user) 
            
        }
        else console.log(err)
    })
})
app.post('/gamewon', async (req, res) => {
    let user = req.body
    let insert 
    let values
    if (!user.name) {
        insert = `UPDATE usernames SET games_played=games_played+1,games_won=games_won+1,has_played=true WHERE address=($1)`
        values = [`${user.address}`]
    } else {
        insert = `UPDATE usernames SET games_played=games_played+1,games_won=games_won+1,has_played=true WHERE username=($1)`
        values = [`${user.name}`]
    }
    post.query(insert, values, (err, result) => {
        if (!err) console.log('Game played & won set to player', user)
        else console.log(err)
    })
})

app.post('/username', (req, res) => {
    let user = req.body
    console.log(user)
    let insert = `UPDATE usernames SET username = ($1) WHERE address = ($2)`;
    const values = [`${user.name}.trx`, `${user.address}`]
    console.log(values)
    post.query(insert, values, (err, result) => {
        if (!err) console.log('Username insertion was successful')
        else console.log(error)
    })
})

app.get('/username', async (req, res) => {
    let userAddress = req.query.addr
    let user 
    
    const select = `SELECT username FROM usernames WHERE address = ($1)`
    const values = [`${userAddress}`]
    post.query(select, values, (err, result) => {
        //if (!err) user = {address: userAddress, username: result.rows[0]}
        if (!err) {
            console.log('Selected query', result.rows[0])
            if (result.rows[0] != undefined) user = {address: userAddress, username: result.rows[0].username}
            if (user) return res.json(user)
        }
        else console.log(err)
    })
})

app.get('/getaddr', async (req, res) => {
    let username = req.query.username
    let address
    const select = `SELECT address FROM usernames WHERE username = ($1)`
    const values = [`${username}`]
    post.query(select, values, (err, result) => {
        if (!err) {
            console.log('Selected query', result)
            if (result.rows != undefined) address = {address: result.rows[0].address, username: username}
            if (address) return res.json(address)
        } else console.log(err)
    })
})
app.post('/unique', async (req, res) => {
    let username = req.query.user
    console.log(username)

    const select = `SELECT COUNT(*) FROM usernames WHERE username = ($1)`
    const value = [`${username}`]

    post.query(select, value, (err, result) => {
        if (!err) {
            console.log('Selected query', result.rows[0].count)
            if (result.rows[0].count == 0) return res.json({unique: true}) 
            if (result.rows[0].count == 1) return res.json({unique: false}) 
        } else console.log(err)

    })
})




console.log('Listening on port 5001')
app.listen(5001)

// REDIS configuration and endpoints for client to fetch, aswell as event listener for smart contract.
import express from 'express'
import cors from 'cors';

import { chessEventListener } from '../../state/state.js';

import { createClient } from 'redis';
const client = createClient({ url: "redis://nick:admin@172.105.106.183:6379"});

const whitelist = ['http://test.trxmini.games', 'http://trxmini.games', 'http://localhost:5173']
const config = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) callback(null, true)
        else callback(new Error(`CORS Policy denied, origin is unexpected origin ${origin}`))
    }
};

const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors(config));


let rooms // For storing the rooms for the client to fetch. 


client.connect()
.then(async () => {
    app.get('/rooms', (req, res) => { // sends REDIS games through rest api
        client.get('ROOMS').then(rooms => {
            res.json(rooms);
        })
    });

    app.get('/endedrooms', (req, res) => { // Sends ended games.
        client.get('ENDEDROOMS').then(rooms => {
            res.json(rooms);
        })
    });

    app.get('/api', async (req, res) => { // For indexing contract events, uptime should be reliable
        const response = await fetch(chessEventListener);
        const data = await response.json();
        return res.json(data);
    });
});


async function getRoomsOnStartup() { // Doesn't require 'ENDEDROOMS' key as this is only grabbing
    if (await client.get('ROOMS') != null) {
        rooms =  await client.get('ROOMS')
        rooms = JSON.parse(rooms)
    } else {
        rooms = []
    }

    console.log(rooms)
} getRoomsOnStartup()


console.log('REDIS endpoints & event API is listening on port 5020');
app.listen(5020);
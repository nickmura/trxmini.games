// REDIS configuration and endpoints for client to fetch, aswell as event listener for smart contract.
import express from 'express'
import cors from 'cors';
import { Server } from 'socket.io'
import { chessEventListener, _redisPasswd } from '../state.js';

import { createClient } from 'redis';
const client = createClient({ url: `redis://nick:${_redisPasswd}@172.105.106.183:6379`});

const whitelist = ['https://test2.trxmini.games', '//test2.trxmini.games', 'https://trxmini.games', 
'//trxmini.games', 'http://localhost:5173', '//localhost:5173', '//127.0.0.1:5173', '//undefined']
const config = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) callback(null, true)
        else callback(new Error(`CORS Policy denied, origin is unexpected origin ${origin}`))
    }
};

const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors());


let rooms // For storing the rooms for the client to fetch. 
let ballRooms = []

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

    app.get('/makeballroom', async (req, res) => {

        let user = req.query.user
        let hasRoom = rooms?.find(room => room.players.includes(user) && room.game == '8 Ball')
        if (!hasRoom) {
            console.log('CREATING 8 BALL ROOM')

            let room8Ball = {game: '8 Ball', players: [user, '(Singleplayer)'], stake:'0'}
            ballRooms.push(room8Ball)

            let jBallRooms = JSON.stringify(rooms)
            await client.set('BALLROOMS', jBallRooms)



            let roomPlaceholder = {place: 'holder'}
            rooms.push(roomPlaceholder)

            let jRooms = JSON.stringify(roomPlaceholder)
            await client.set('ROOMS', jRooms)


            setTimeout(async () => {
                const find8BallGame = rooms?.findIndex(room => room.game == '8 Ball')
                if (find8BallGame > -1) rooms.splice(find8BallGame, 1)

                let jRooms = JSON.stringify(rooms)
                await client.set('ROOMS', jRooms)

                console.log('REMOVING 8BALL ROOM')
            }, 1200000)
            
        } else console.log('PLAYER ALREADY HAS 8 BALL ROOM')
    })
});

app.get('/getballrooms', async (req, res) => {
    client.get('BALLROOMS').then(ballrooms => {
        res.json(ballrooms);
    })
})
async function getRoomsOnStartup() { // Doesn't require 'ENDEDROOMS' key as this is only grabbing
    if (await client.get('ROOMS') != null) {
        rooms =  await client.get('ROOMS')
        rooms = JSON.parse(rooms)
    } else {
        rooms = []
    }

    console.log(rooms)
} getRoomsOnStartup()




const io = new Server(4903, {
    cors: {
        origin: '*',
    }
})

io.on('connection', (socket) => {
    socket.on('tippedPlayer', (from, to, amount, txid) => {
        console.log(`${from} HAS SENT ${to} ${amount} TRX`)
        io.emit('recievedTip', from, to, amount, txid);
    })
})
app.listen(5020);

console.log('REDIS endpoints & event API is listening on port 5020 & listening on port 4903 (web socket connection for player tips)');
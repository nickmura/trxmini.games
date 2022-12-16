// REDIS configuration and endpoints for client to fetch, aswell as event listener for smart contract.
import express from 'express'
import cors from 'cors';
import { Server } from 'socket.io'
import { chessEventListener, _redisPasswd, postRequest } from '../state.js';
import { createClient } from 'redis';
import { io } from 'socket.io-client';

const client = createClient({ url: `redis://nick:${_redisPasswd}@192.53.123.185:6379`});

const whitelist = ['https://test2.trxmini.games', '//test2.trxmini.games', 'https://trxmini.games', 
'//trxmini.games', 'http://localhost:5173', '//localhost:5173', '//127.0.0.1:5173', '//undefined']
const config = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) callback(null, true)
        else callback(new Error(`CORS Policy denied, origin is unexpected origin ${origin}`))
    }
};

const socket = io('http://localhost:3001/') // For relaying to make a placeholder for the game.

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
        //await getRoomsOnStartup()
        let hasRoom
        
        await client.get('BALLROOMS').then(rooms => {
            ballRooms = JSON.parse(rooms)
            console.log(ballRooms)
        })


        if (ballRooms != []) hasRoom = ballRooms?.find(room => room.players.includes(user) && room.game == '8 Ball')
        console.log(hasRoom)


        if (!hasRoom) {
            console.log('CREATING 8 BALL ROOM')

            let ballRoom = {game: '8 Ball', players: [user, '(Singleplayer)'], stake:'0'}
            
            //console.log(ballRooms)

            // let jBallRooms = JSON.stringify(rooms)
            // await client.set('BALLROOMS', jBallRooms)

            let placeholder = {place: 'holder', players: [], person: user}
            // Gonna create a socket emit to the chess server, which will push the place holder to the array. Apparently, it doesn't like
            // redis instance initalizing the array.

            socket.emit('createBallRoom', ballRoom, placeholder)



            setTimeout(async () => {

                socket.emit('deleteBallRoom', user);
                
            }, 720000)
            
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
        let jRooms =  await client.get('ROOMS')
        rooms = JSON.parse(jRooms)
    } else {
        rooms = []
    }
    if (await client.get('BALLROOMS') != null) {
        let jBallRooms = await client.get('BALLROOMS')
        ballRooms = JSON.parse(jBallRooms)
    } else {
        ballRooms = []
    }

    console.log(rooms)
} getRoomsOnStartup()







const server = new Server(4903, {
    cors: {
        origin: '*',
    }
})

server.on('connection', async (socket) => {
    socket.on('tippedPlayer', async (from, to, amount, txid) => {
        console.log(`${from} HAS SENT ${to} ${amount} TRX`)
        let url = 'http://170.187.182.220:5001/tipnotification'
        let body = JSON.stringify({sender: from, recipient: to, amount: amount, txid: txid})
        server.emit('recievedTip', from, to, amount, txid);
        postRequest(url, body)
    })

    socket.on('wonChessWager', async (winner, opponent, txid, amount) => {
        console.log('wonChessWager', winner)
        let url = 'http://170.187.182.220:5001/chessnotification'
        let body
        if (winner.includes('.trx')) {
            body = JSON.stringify({winner: winner, opponent: opponent, amount: amount, txid: txid})
        } else {
            body = JSON.stringify({address: winner, opponent: opponent, amount: amount, txid: txid})
        }
        
        try { 
            postRequest(url, body)
        } catch (error) {
            console.log(error)
        }
            
    })
})
app.listen(5020);

console.log('REDIS endpoints & event API is listening on port 5020 & listening on port 4903 (web socket connection for player tips)');
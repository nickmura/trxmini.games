import { Server } from 'socket.io'

import express from 'express';
import cors from 'cors';
import { eventAPI } from '../../state/state.js'
import { createClient } from 'redis';
const client = createClient({ url: "redis://nick:admin@172.105.106.183:6379"});
client.connect()

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const whitelist = ['//test2.trxmini.games', '//test2.trxmini.games', '//trxmini.games', 
'//trxmini.games', '//localhost:5173', '//localhost:5173']
const config = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) callback(null, true)
        else callback(new Error(`CORS Policy denied, origin is unexpected origin ${origin}`))
    }
}
app.use(cors(config));

let rooms = [];
let endedRooms = []



async function getRooms() {
    if (await client.get('ROOMS')) {
        rooms =  await client.get('ROOMS')
        rooms = JSON.parse(rooms)
    } else {
        rooms = []
    }
    console.log('getRooms (redis get ROOMS)', rooms)
} getRooms()

async function getEndedRooms() {
    if (await client.get('ENDEDROOMS')) {
        endedRooms =  await client.get('ENDEDROOMS')
        endedRooms = JSON.parse(endedRooms)
    } else {
        endedRooms = []
    }
    console.log('getEndedRooms (redis get ENDEDROOMS)', endedRooms)
} getEndedRooms()



const io = new Server(3001, {
    cors: {
        origin: '*',
    }
})

io.on('connection', (socket) => {
    // For creating game
    socket.on('createRoom', async (uuid, room) => {
        console.log(`PLAYER ${room.host} CREATED A ROOM... CREATING...`)
        socket.join(`${uuid}`)

        // Calls contract events from API until it gets what it needs
        let counter = 0
        while (room.index == '' && counter < 5000 || room.index == undefined && counter < 5000) {
            counter++
            let events
            const res = await fetch(eventAPI)
            if (res) events = await res.json()
            let event = events.data.find(event => event?.result._gameId == uuid.toString())
            room.index = event?.result.index;
        } 
        console.log(counter)
        rooms.push(room)
        console.log(`ROOM ${uuid} HAS BEEN CREATED:`, room)
    
        let jRooms = JSON.stringify(rooms)
        client.set('ROOMS', jRooms)
    })


    //For joining game
    socket.on('getGameIndex', (gameId) => {
        let room = rooms.find(room => room.gameID === gameId)
        console.log(`PLAYER ATTEMPTING TO CONNECT TO ROOM ${gameId} WAGER & STAKE:`, room.index, room.stake)
        socket.emit('fetchedIndex', room.index, room.stake)
    })


    socket.on('joinRoom', (player, gameId) => {
        socket.join(`${gameId}`)
        let room = rooms.find(room => room.gameID === gameId)

        // updates game state with new player and functional chessboard
        room.players.push(player)
        room.player2 = player
        room.fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        room.orientation = player // for when game ends, retrieve orientation if player black

        console.log(`PLAYER ${player} IS JOINING ROOM ${gameId}`)
        let jRooms = JSON.stringify(rooms)
        client.set('ROOMS', jRooms)

        console.log(room.gameID)
        io.to(`${room.gameID}`).emit('playerJoined', room.fen)
    })

    socket.on('sendMessage', (chatlog) => {
        console.log(chatlog)
        let room = rooms.find(room => room.players.includes(chatlog.user))
        socket.join(`${room.gameID}`)

        room.chat.push(chatlog)

        let jRooms = JSON.stringify(rooms)
        client.set('ROOMS', jRooms)

        io.to(`${room.gameID}`).emit('recieveMessage', room.chat)
    })
    socket.on('chessMove', (player, fenValue) => {
        console.log(player)
        let room = rooms.find(room => room.players.includes(player))
        socket.join(`${room.gameID}`)

        room.fen = fenValue
        console.log(`CHESS MOVE IN ${room.gameID}`, room.fen)

        if (player == room.host) {
            room.currentTurn = room.player2
            io.to(`${room.gameID}`).emit('emitMove', fenValue, room.player2)
        } else if (player == room.player2) {
            room.currentTurn = room.host
            io.to(`${room.gameID}`).emit('emitMove', fenValue, room.host)
        }
        let jRooms = JSON.stringify(rooms)
        client.set('ROOMS', jRooms)
        // emits the fenValue to the specific room
    })


    socket.on('reconnectPlayer', (room) => {
        socket.join(`${room.gameID}`)
    })

    // Game outcomes (checkmate, stalemate, draw... etc) <!------ !>
    socket.on('isCheckmate', (winner) => {
        let room = rooms?.find(room => room.players.includes(winner))
        room.isCheckmate = winner
        console.log(`CHECKMATE by ${winner} in ROOM ${room.gameID}`)
        let jRooms = JSON.stringify(rooms)
        client.set('ROOMS', jRooms)
    })

    socket.on('isStalemate', (player) => {
        let room = rooms?.find(room => room.players.includes(player))
        console.log(`ROOM ${room.gameID} IS A STALEMATE (draw)`)
        room.isStalemate = 'true'

        let jRooms = JSON.stringify(rooms)
        client.set('ROOMS', jRooms)
    })

    socket.on('isDraw', (player) => {
        let room = rooms?.find(room => room.players.includes(player))
        console.log(`ROOM ${room.gameID} IS A DRAW`)
        room.isDraw = 'true'

        let jRooms = JSON.stringify(rooms)
        client.set('ROOMS', jRooms)
        
    })

    // Fetched wager stake <!------ !> <!------ !> <!------ !> (BUSINESS LOGIC)
    socket.on('redeemedStake', (player) => {
        let room
        if (rooms?.find(room => room.players.includes(player))) {
            room = rooms.find(room => room.players.includes(player))
            room.redeemedStake.push(player)
            console.log('getRooms - redeemedStake', room)

            let jRooms = JSON.stringify(rooms)
            client.set('ROOMS', jRooms)
           
        } else if (endedRooms?.find(room => room.players.includes(player))) {
            room = endedRooms.find(room => room.players.includes(player))
            room.redeemedStake.push(player)
            console.log('getEndedRooms - redeemedStake', room)

            let jEndedRooms = JSON.stringify(endedRooms)
            client.set('ENDEDROOMS', jEndedRooms)
        }
        console.log(`PLAYER ${player} IN ROOM ${room.gameID} HAS REDEEMED THEIR STAKE`)
    })

    socket.on('redeemedDraw', (player) => { 
        let room
        if (rooms?.find(room => room.players.includes(player))) {
            room = rooms.find(room => room.players.includes(player))
            room.redeemedDraw.push(player)
    
            let jRooms = JSON.stringify(rooms)
            client.set('ROOMS', jRooms)
            
        } else if (endedRooms?.find(room => room.players.includes(player))) {
            room = endedRooms.find(room => room.players.includes(player))
            room.redeemedDraw.push(player)

            let jEndedRooms = JSON.stringify(endedRooms)
            client.set('ENDEDROOMS', jEndedRooms)
        }
        console.log(`(DRAW) PLAYER ${player} IN ROOM ${room.gameID} HAS REDEEMED HALF THE STAKE`)
    })

    socket.on('avertGame', (player) => {
        let room
        if (rooms?.find(room => room.players.includes(player))) {
            room = rooms.find(room => room.players.includes(player))
            
            room.redeemedDraw.push(player)
    
            let jRooms = JSON.stringify(rooms)
            client.set('ROOMS', jRooms)
        }

    })
    // Long because of the different side effects <!------ !> <!------ !> <!------ !> Leaving and ending room from cache
    // that need to be handled from leaving a game <!------ !> <!------ !> <!------ !>
    socket.on('deleteRoom', (player) => {
        if (rooms?.find(room => room.players.includes(player) && room.players.length > 1)) {

            let room = rooms.find(room => room.players.includes(player))
            socket.leave(`${room.gameID}`)

            const index = rooms.findIndex(room => room.players.includes(player)) // gets rid of room from active rooms
            const findPlayer = room.players.findIndex(disconnected => disconnected == player) // Removes player from the game so player who leaves
            if (findPlayer > -1) room.players.splice(findPlayer, 1) // doesn't retrieve game state from endedRooms

            if (room.host == player) room.host = '' 
            else if (room.player2 == player) room.player2 = ''

            endedRooms.push(room) // adds room to endedRooms, which is stored in Redis below (client.set('ENDEDROOMS'))
            let jEndedRooms = JSON.stringify(endedRooms)
            client.set('ENDEDROOMS', jEndedRooms)

            if (index > -1) rooms.splice(index, 1)

            let jRooms = JSON.stringify(rooms)
            client.set('ROOMS', jRooms)

            console.log(`PLAYER ${player} HAS LEFT AND DELETED ROOM ${room.gameID}`)

            console.log('ROOMS', rooms)
            console.log('ENDEDROOMS', endedRooms)
            
            
        } if (rooms?.find(room => room.players.includes(player) && room.players.length < 2)) { // Doesn't save game in endedRooms as there's only one player.

            let room = rooms.find(room => room.players.includes(player))
            console.log(`PLAYER ${player} HAS LEFT AND DELETED ROOM ${room.gameID}`)
            socket.leave(`${room.gameID}`)

            const index = rooms.findIndex(room => room.gameID === parseInt(room.gameID))
            if (index > -1) rooms.splice(index, 1)

            let jRooms = JSON.stringify(rooms)
            client.set('ROOMS', jRooms)
    
        } else if (endedRooms.find(room => room.players.includes(player)) ) {
            let room = endedRooms.find(room => room.players.includes(player))
            console.log(`PLAYER ${player} HAS LEFT AND DELETED GAME ${room.gameID} FROM endedROOMS (ALREADY DELETED)`)

            const index = endedRooms?.findIndex(room => room.players.includes(player))
            if (index > -1) endedRooms.splice(index, 1)

            let jEndedRooms = JSON.stringify(endedRooms) // Removes game from endedRooms as there will be nobody in it.
            client.set('ENDEDROOMS', jEndedRooms)
        }
    })

})
console.log('Listening on port 3001 for chess-game websocket instructions - trxmini.games')
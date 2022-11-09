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
app.use(cors());

let rooms = [];
let endedRooms = []

const io = new Server(3001, {
    cors: {
        origin: '*',
    }
})

io.on('connection', (socket) => {
    socket.on('createRoom', async (uuid, room) => {
        console.log(uuid)
        socket.join(`${uuid}`)

        let counter = 0;
        while (room.index == '' && counter < 5000 || room.index == undefined && counter < 5000) {
            counter++;
            let events;
            const res = await fetch(eventAPI);
            if (res) events = await res.json()
            let event = events.data.find(event => event?.result._gameId == uuid);
            room.index = event?.result.index;
        } console.log(`FETCHING ROOM ${uuid} EVENT TOOK ${counter} TRIES`);
        rooms.push(room);
        console.log(`ROOM ${uuid} HAS BEEN CREATED:`, room);
    
        let jRooms = JSON.stringify(rooms)
        client.set('ROOMS', jRooms)
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
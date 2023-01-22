import { Server } from 'socket.io'

import express from 'express';
import cors from 'cors';

//@ts-ignore ==> For imports on server.
import { eventAPI, _redisPasswd } from '../state.js'
import { createClient } from 'redis';

//@ts-ignore ==> for imports on server.
import type { Rooms, Chat, WagerTx } from '../state.js'

const client = createClient({ url: `redis://nick:${_redisPasswd}@172.105.106.183:6379` });
client.connect();


const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())
const whitelist = ['//test2.trxmini.games', '//test2.trxmini.games', '//trxmini.games',
    '//trxmini.games', '//localhost:5173', '//localhost:5173']
const config = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) callback(null, true)
        else callback(new Error(`CORS Policy denied, origin is unexpected origin ${origin}`))
    }
}
app.use(cors(config));

let rooms:Rooms[] | string;
let endedRooms:Rooms[] | string
let ballRooms:Rooms[] | string = []




function isRooms(object: any): object is Rooms[] { // Checks if it meets Rooms[] type
    return 'Rooms' in object;
}

async function setRooms(room) { // set the Value of Rooms to redis
    if (isRooms(rooms)) rooms.push(room)
    let jRooms = JSON.stringify(rooms)
    client.set('ROOMS', jRooms)
}

async function setEndedRooms(room) { // set the Value of ENDEDROOMS to redis
    if (isRooms(endedRooms)) endedRooms.push(room)
    let jEndedRooms = JSON.stringify(endedRooms)
    client.set('ROOMS', jEndedRooms)
}

async function getRooms() {
    let jRooms = await client.get('ROOMS')
    if (jRooms != null) rooms = JSON.parse(jRooms)
    if (!jRooms) {
        rooms = []
    }
    
    console.log(rooms)
    return rooms
} getRooms()

async function getEndedRooms() {
    let jEndedRooms = await client.get('ENDEDROOMS')
    if (jEndedRooms != null) endedRooms = JSON.parse(jEndedRooms)
    if (!jEndedRooms) endedRooms = []
    
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
        if (room.stake != '0') {
            while (room.index == '' && counter < 5000 || room.index == undefined && counter < 5000) {
                counter++
                let events
                const res = await fetch(eventAPI)
                if (res) events = await res.json()
                let event = events.data.find(event => event?.result._gameId == uuid.toString())
                room.index = event?.result.index;
            }
        }
        console.log(counter);
        
        setRooms(room);
        console.log(`ROOM ${uuid} HAS BEEN CREATED:`, room)

    })


    //For joining game
    socket.on('getGameIndex', (gameId) => {
        socket.join(`${gameId}`)
        let room
        if (isRooms(rooms)) room = rooms.find(room => room.gameID === gameId)
        console.log(`PLAYER ATTEMPTING TO CONNECT TO ROOM ${gameId} WAGER & STAKE:`, room.index, room.stake)
        socket.emit('fetchedIndex', room.index, room.stake)
    })


    socket.on('joinRoom', (player, gameId) => {
        socket.join(`${gameId}`)
        let room
        if (isRooms(rooms)) room = rooms.find(room => room.gameID === gameId)
        // updates game state with new player and functional 
        // 
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

        let room 
        if (isRooms(rooms)) room = rooms?.find(room => room.players.includes(chatlog.user))
        if (!room && isRooms(endedRooms)) room = endedRooms.find(room => room.players.includes(chatlog.user))

        console.log(room)
        socket.join(`${room.gameID}`)
        room.chat.push(chatlog)

        if (room.idle == true && chatlog.msg != '/forfeit' && room.players.length > 1) {
            room.idle = false
            console.log('GAME HAS RESUMED')
            let command = {user: 'SYSTEM', msg: `Game has resumed due to activity.`}
            room.chat.push(command)

            
            let jRooms = JSON.stringify(rooms)
            client.set('ROOMS', jRooms)
        } 

        let jRooms = JSON.stringify(rooms)
        client.set('ROOMS', jRooms)

        io.to(`${room.gameID}`).emit('recieveMessage', room.chat)

        if (chatlog.msg == '/forfeit' && room.idle == false && room.players.length > 1) {
            room.idle = true

            let command = { command: true, user: 'SYSTEM', msg: `User ${chatlog.user} has requested
            a draw. If there are no movements, or chat messages in the next 5 minutes, the game will draw.`, request: chatlog.user}
            
            console.log('USER HAS REQUESTED FORFEIT', command)
            
            room.chat.push(command)

            let jRooms = JSON.stringify(rooms)
            client.set('ROOMS', jRooms)

            io.to(`${room.gameID}`).emit('recieveMessage', room.chat)

            setTimeout(() => {
                console.log(room)
                if (room.idle == true) {

                    let player = chatlog.user
                    console.log('GAME HAS NOW ENDED DUE TO IDLE')

                    let command = { command: true, user: 'SYSTEM', msg: `Game has drawed due to idle exceeding 5 minutes and forfeit.`, request: chatlog.user}                      
                    room.chat.push(command)

                    io.to(`${room.gameID}`).emit('recieveMessage', room.chat)
                    
                    if (room.stake == '0') {
                        room.redeemedDraw = room.players
                    }

                    room.isDraw = 'true'
                    room.fen = ''


                    let opponent = room.players.find(opponent => opponent != player);
                    
                    let playerObject;
                    
                    if (player.includes('.trx')) { // Checks if player is an address or a username
                        playerObject = JSON.stringify({ address: '', name: player })
                    } else {
                        playerObject = JSON.stringify({ address: player })
                    }

                    const playerOpponentUrl = 'http://170.187.182.220:5001/gameplayed'
                    
                    const submitPlayerData = async (url) => { // sending address to express and postgres
                        const res = await fetch(url, {
                            method: 'post',
                            headers: { 'Content-Type': 'application/json' },
                            body: playerObject,
                        })
                        if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
                        return res
                    }       
                    submitPlayerData(playerOpponentUrl)
                        .then(res => console.log(res))
                        .catch(err => console.error(err))

                    let opponentObject
                    
                    if (opponent.includes('.trx')) { // Checks if opponent is an address or a username
                        opponentObject = JSON.stringify({ address: '', name: opponent })
                    } else {
                        opponentObject = JSON.stringify({ address: opponent })
                    }

                    const submitOpponentData = async (url) => { // sending address to express and postgres
                        const res = await fetch(url, {
                            method: 'post',
                            headers: { 'Content-Type': 'application/json' },
                            body: opponentObject,                
                        })
                        if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
                        return res
                        }       
                    submitOpponentData(playerOpponentUrl)
                        .then(res => console.log(res))
                        .catch(err => console.error(err))



                    let jRooms = JSON.stringify(rooms)
                    client.set('ROOMS', jRooms)

                    io.to(`${room.gameID}`).emit('gameForfeited')
                    
                     
                }
            }, 300000)
        }

    })
    socket.on('chessMove', (player, fenValue) => {
        console.log(player)
        let room 
        if (isRooms(rooms)) room = rooms.find(room => room.players.includes(player))
        socket.join(`${room.gameID}`)

        room.fen = fenValue
        if (room.idle == true) {
            room.idle = false
            console.log('GAME HAS RESUMED')
            let command = {user: 'SYSTEM', msg: `Game has resumed due to activity.`}
            room.chat.push(command)

            let jRooms = JSON.stringify(rooms)
            client.set('ROOMS', jRooms)
            io.to(`${room.gameID}`).emit('recieveMessage', room.chat)


        }
        room.idle = false

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
    socket.on('isCheckmate', async (winner) => {
        let room
        if (isRooms(rooms)) room = rooms?.find(room => room.players.includes(winner))
        room.isCheckmate = winner
        console.log(`CHECKMATE by ${winner} in ROOM ${room.gameID}`)

        let jRooms = JSON.stringify(rooms)
        client.set('ROOMS', jRooms)


        let loser = room.players?.find(player => player != winner)
        let winnerObject
        let loserObject


        // It needs to be a post request because whether or not the user is an address / username.


        if (winner.includes('.trx')) { // Checks if winner is an address or a username
            winnerObject = JSON.stringify({ address: '', name: winner })
        } else {
            winnerObject = JSON.stringify({ address: winner })
        }


        if (loser.includes('.trx')) { // Checks if loser is an address or a username
            loserObject = JSON.stringify({ address: '', name: loser })
        } else {
            loserObject = JSON.stringify({ address: loser })
        }



        // Gives xp to the winner
        const winUrl = 'http://170.187.182.220:5001/gamewon'
        const submitWinnerData = async (url) => { // sending address to express and postgres
            const res = await fetch(url, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: winnerObject,
            })
            if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
            return res
        }
        submitWinnerData(winUrl)
            .then(res => console.log(res))
            .catch(err => console.error(err))



        // Gives xp to the loser (sorry)
        const lossUrl = 'http://170.187.182.220:5001/gameplayed'
        const submitLoserData = async (url) => { // sending address to express and postgres
            const res = await fetch(url, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: loserObject,
            })
            if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
            return res
        }
        submitLoserData(lossUrl)
            .then(res => console.log(res))
            .catch(err => console.error(err))


    })

    socket.on('isStalemate', (player) => {
        let room
        if (isRooms(rooms)) room = rooms?.find(room => room.players.includes(player))

        console.log(`ROOM ${room.gameID} IS A STALEMATE (draw)`)
        room.isStalemate = 'true'

        let opponent = room.players.find(opponent => opponent != player);

        let playerObject
        
        if (player.includes('.trx')) { // Checks if player is an address or a username
            playerObject = JSON.stringify({ address: '', name: player })
        } else {
            playerObject = JSON.stringify({ address: player })
        }

        const playerOpponentUrl = 'http://170.187.182.220:5001/gameplayed'
        const submitPlayerData = async (url) => { // sending address to express and postgres
            const res = await fetch(url, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: playerObject,
            })
            if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
            return res
        }       
        submitPlayerData(playerOpponentUrl)
            .then(res => console.log(res))
            .catch(err => console.error(err))

        let opponentObject
        
        if (opponent.includes('.trx')) { // Checks if opponent is an address or a username
            opponentObject = JSON.stringify({ address: '', name: opponent })
        } else {
            opponentObject = JSON.stringify({ address: opponent })
        }

        const submitOpponentData = async (url) => { // sending address to express and postgres
            const res = await fetch(url, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: opponentObject,                
            })
            if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
            return res
            }       
        submitOpponentData(playerOpponentUrl)
            .then(res => console.log(res))
            .catch(err => console.error(err))

        let jRooms = JSON.stringify(rooms)
        client.set('ROOMS', jRooms)
    })

    socket.on('isDraw', (player) => {
        let room
        if (isRooms(rooms)) room = rooms?.find(room => room.players.includes(player))
        console.log(`ROOM ${room.gameID} IS A DRAW`)
        room.isDraw = 'true'

        
        let playerObject
        
        if (player.includes('.trx')) { // Checks if player is an address or a username
            playerObject = JSON.stringify({ address: '', name: player })
        } else {
            playerObject = JSON.stringify({ address: player })
        }

        const playerOpponentUrl = 'http://170.187.182.220:5001/gameplayed'
        const submitPlayerData = async (url) => { // sending address to express and postgres
            const res = await fetch(url, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: playerObject,
            })
            if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
            return res
        }       
        submitPlayerData(playerOpponentUrl)
            .then(res => console.log(res))
            .catch(err => console.error(err))
        
        let opponent = room.players.find(opponent => opponent != player);
        let opponentObject
        
        if (opponent.includes('.trx')) { // Checks if opponent is an address or a username
            opponentObject = JSON.stringify({ address: '', name: opponent })
        } else {
            opponentObject = JSON.stringify({ address: opponent })
        }

        const submitOpponentData = async (url) => { // sending address to express and postgres
            const res = await fetch(url, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: opponentObject,                
            })
            if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
            return res
            }       
        submitOpponentData(playerOpponentUrl)
            .then(res => console.log(res))
            .catch(err => console.error(err))




        let jRooms = JSON.stringify(rooms)
        client.set('ROOMS', jRooms)

    })

    // Fetched wager stake <!------ !> <!------ !> <!------ !> (BUSINESS LOGIC)
    socket.on('redeemedStake', (player, tx) => {

        let room
        let endedRoom
        if (isRooms(rooms)) room = rooms?.find(room => room.players.includes(player))
        if (isRooms(endedRooms)) endedRoom = endedRooms?.find(room => room.players.includes(player))
        if (room) {

            room.redeemedStake.push(player)

            room.wagerTxs.push({ user: player, txid: tx })

            console.log('getRooms - redeemedStake', room)

            let jRooms = JSON.stringify(rooms)
            client.set('ROOMS', jRooms)

            
        } else if (endedRoom) {
            // room = endedRooms.find(room => room.players.includes(player))
            endedRoom.redeemedStake.push(player)

            endedRoom.wagerTxs.push({ user: player, txid: tx })

            console.log('getEndedRooms - redeemedStake', room)

            let jEndedRooms = JSON.stringify(endedRooms)
            client.set('ENDEDROOMS', jEndedRooms)
        }
        console.log(`PLAYER ${player} IN ROOM ${room.gameID} HAS REDEEMED THEIR STAKE`)
    })

    socket.on('redeemedDraw', (player, tx) => {
        let room
        let endedRoom
        if (isRooms(rooms)) room = rooms?.find(room => room.players.includes(player))
        if (isRooms(endedRooms)) endedRoom = endedRooms?.find(room => room.players.includes(player))
        if (room) {
            // room = rooms.find(room => room.players.includes(player))
            room.redeemedDraw.push(player)

            room.wagerTxs.push({ user: player, txid: tx })

            let jRooms = JSON.stringify(rooms)
            client.set('ROOMS', jRooms)

        } else if (endedRoom) {
            // room = endedRooms.find(room => room.players.includes(player))
            endedRoom.redeemedDraw.push(player)

            endedRoom.wagerTxs.push({ user: player, txid: tx })

            let jEndedRooms = JSON.stringify(endedRooms)
            client.set('ENDEDROOMS', jEndedRooms)
        }
        console.log(`(DRAW) PLAYER ${player} IN ROOM ${room.gameID} HAS REDEEMED HALF THE STAKE`)
    })



    socket.on('avertGame', (player, tx) => {
        let room
        if (isRooms(rooms)) room = rooms?.find(room => room.players.includes(player))

        if (room) {
            // room = rooms.find(room => room.players.includes(player))
            room.redeemedDraw.push(player)

            room.wagerTxs.push({ user: player, txid: tx })

            console.log(`PLAYER ${player} HAS AVERTED GAME AND TOOK THEIR FUNDS`)

            let jRooms = JSON.stringify(rooms)
            client.set('ROOMS', jRooms)
        }

    })
    // Long because of the different side effects <!------ !> <!------ !> <!------ !> Leaving and ending room from cache
    // that need to be handled from leaving a game <!------ !> <!------ !> <!------ !>
    socket.on('deleteRoom', (player) => {
        let room
        let endedRoom
        let index
        let findPlayer
        if (isRooms(rooms)) room = rooms?.find(room => room.players.includes(player))
        if (isRooms(endedRooms)) endedRoom = endedRooms?.find(room => room.players.includes(player))
        if (room && room.players.length > 1) {

            // let room = rooms.find(room => room.players.includes(player))
            socket.leave(`${room.gameID}`)
            if (isRooms(rooms)) {
                index = rooms.findIndex(room => room.players.includes(player)) // gets rid of room from active rooms
                findPlayer = room.players.findIndex(disconnected => disconnected == player) // Removes player from the game so player who leaves
            }
            
            if (findPlayer > -1) room.players.splice(findPlayer, 1) // doesn't retrieve game state from endedRooms

            if (room.host == player) room.host = ''
            else if (room.player2 == player) room.player2 = ''

            setEndedRooms(room)// adds room to endedRooms, which is stored in Redis below (client.set('ENDEDROOMS'))
            // let jEndedRooms = JSON.stringify(endedRooms)
            // client.set('ENDEDROOMS', jEndedRooms)

            if (index > -1 && isRooms(rooms)) rooms.splice(index, 1)

            let jRooms = JSON.stringify(rooms)
            client.set('ROOMS', jRooms)

            console.log(`PLAYER ${player} HAS LEFT AND DELETED ROOM ${room.gameID}`)

            console.log('ROOMS', rooms)
            console.log('ENDEDROOMS', endedRooms)


        } if (room && room.players.length < 2) { // Doesn't save game in endedRooms as there's only one player.

            // let room = rooms.find(room => room.players.includes(player))
            console.log(`PLAYER ${player} HAS LEFT AND DELETED ROOM ${room.gameID}`)
            socket.leave(`${room.gameID}`)

            if (isRooms(rooms)) {
                index = rooms.findIndex(room => room.players.includes(player))
                if (index > -1) rooms.splice(index, 1)
    
            }

            let jRooms = JSON.stringify(rooms)
            client.set('ROOMS', jRooms)

        } else if (endedRoom) {
            // let room = endedRooms.find(room => room.players.includes(player))
            console.log(`PLAYER ${player} HAS LEFT AND DELETED GAME ${room.gameID} FROM endedROOMS (ALREADY DELETED)`)

            if (isRooms(endedRooms)) {
                index = endedRooms?.findIndex(room => room.players.includes(player))
                if (index > -1) endedRooms.splice(index, 1)
            }


            let jEndedRooms = JSON.stringify(endedRooms) // Removes game from endedRooms as there will be nobody in it.
            client.set('ENDEDROOMS', jEndedRooms)
        }
    })

    socket.on('createBallRoom', async (room, placeholder) => {
        // Pushes placeholder for 8 Ball game to the main rooms array, and into redis.
        // The reason it needs to be a place holder is because I would need to add AND operators to check the game
        // all of the server logic and client logic for chess specific room object indexes, which could be faulty,
        // problematic considering how many there are. 8 ball indexes will be stored on a different key value for redis.

        if (isRooms(ballRooms) && isRooms(rooms)) {
            ballRooms.push(room)
            rooms.push(placeholder)
        }

        let jBallRooms = JSON.stringify(ballRooms)
        await client.set('BALLROOMS', jBallRooms)

        let jRooms = JSON.stringify(rooms)
        await client.set('ROOMS', jRooms)
    })

    socket.on('deleteBallRoom', async (user) => {
        let findPlaceholder
        let find8BallGame


        console.log(user);
        if (isRooms(rooms)) {
            findPlaceholder = rooms?.findIndex(room => room.place == 'holder' && room.person == user)
            if (findPlaceholder > -1) rooms.splice(findPlaceholder, 1)
        }



        let jRooms = JSON.stringify(rooms)
        await client.set('ROOMS', jRooms)

        console.log(ballRooms)
        if (isRooms(ballRooms)) {
            find8BallGame = ballRooms?.findIndex(room => room.players.includes(user))
            if (find8BallGame > -1) ballRooms.splice(find8BallGame, 1)
        }

        let jBallRooms = JSON.stringify(ballRooms)
        await client.set('BALLROOMS', jBallRooms)

    })

})



console.log('Listening on port 3001 for chess-game websocket instructions - trxmini.games')

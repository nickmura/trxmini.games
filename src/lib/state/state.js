// REMOVE LOCALHOST AND CHANGE TO IP OF DEV SERVER / PROD SERVER WHEN DEPLOYED
//  / // / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / ? ?
//  / // / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / ? ?

import { writable } from 'svelte/store';

export const connectedAddress = writable();
export const connectedChain = writable(false);
export const connectedUsername = writable()
export const getBalance = writable() 

export const createPrompt = writable(false)
export const selectedOption = writable('Chess')
export const inGame = writable(false)

export const creatingGame = writable()
// POSTGRES ENDPOINTS
export const url0 = 'http://170.187.182.220:5001/address'
export const url1 = 'http://170.187.182.220:5001/username'

// REDIS ENDPOINTS

export const urlRooms = 'http://172.105.106.183:5020/rooms'
export const urlEndedRooms = 'http://172.105.106.183:5020/endedrooms'



// chess contract, aswell as endpoint that Listens for contract events via trongrid.io API, such as the index which is a nessescary parameter to invoke the relevant struct.
export const chessContract = 'TMGBGionnPs1TFRHxNrZRiGneZaDi6zkBh'
export const _chessContract  = 'TQyY41mqbHVWWHWt5Zq1pPL5rYd7HgM2kE'

export const chessEventListener = `https://api.shasta.trongrid.io/v1/contracts/${chessContract}/events` 
export const eventAPI = 'http://172.105.106.183:5020/api'
 
// Chess socket.io endpoint
export const chessWs = 'http://172.105.106.183:3001';
export const currentState = writable('') // Saves current FEN state of chess game.
export const wagerTx = writable()
export const theRoom = writable()

let prompted = false
export async function createGameForm() { // Create game prompt state sharing between components
    prompted = !prompted
    createPrompt.set(prompted)
}


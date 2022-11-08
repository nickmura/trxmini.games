import { writable } from 'svelte/store'


export const connectedAddress = writable()
export const connectedUsername = writable()
export const getBalance = writable() 

export const createPrompt = writable()
export const selectedOption = writable('Chess')

export const url0 = 'http://localhost:5001/address'
export const url1 = 'http://localhost:5001/username'

export const chessContract  = 'TQyY41mqbHVWWHWt5Zq1pPL5rYd7HgM2kE'

// Listens for contract events, such as the index which is a nessescary parameter to invoke the relevant struct.
export const chessEventListener = `https://api.shasta.trongrid.io/v1/contracts/${chessContract}/events` 
export const eventAPI = 'http://localhost:5001/api'


let prompted = false
export function createGameForm() { // Create game prompt state sharing between components
    prompted = !prompted
    createPrompt.set(prompted)
}


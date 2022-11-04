import { writable } from 'svelte/store'


export const connectedAddress = writable()
export const connectedUsername = writable()


export const url0 = 'http://localhost:5001/address'
export const url1 = 'http://localhost:5001/username'
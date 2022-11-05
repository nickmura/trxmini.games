import { writable } from 'svelte/store'


export const connectedAddress = writable()
export const connectedUsername = writable()


export const url0 = 'http://170.187.182.220:5001/address'
export const url1 = 'http://170.187.182.220:5001/username'
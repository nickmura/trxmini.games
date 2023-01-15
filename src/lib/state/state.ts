// REMOVE LOCALHOST AND CHANGE TO IP OF DEV SERVER / PROD SERVER WHEN DEPLOYED
//  / // / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / ? ?
//  / // / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / / ? ?
interface Badge {
    name: string
    bio: string,
    img: string,
    rarity: string,
    description: string
}

interface Profile {
    address: string,
    username: string,
    default_username: string,
    img: string,
    has_played: boolean,
    games_played: number,
    games_won: number,
    has_won_8ball: boolean,
    xp: number,
    is_beta: boolean,
    description: string
}

interface PostBody {
    x: string,
    y: string,
}

export interface Chat {
    user: string,
    msg: string,
    command: boolean,
    request: string,
}

export interface WagerTx {
    txid: string,
    user: string,
    player: string,
}

export interface Rooms {
    gameID: number,
    game: string, 
    players: String[], 
    host: string,
    player2: string, 
    chat: Chat[],
    orientation: string, // For when the game ends, client can know what the orientation was.
    fen: string,
    isCheckmate: string, 
    isStalemate: string,
    isDraw: string, 
    stake: string,
    place: boolean,
    token: string,             
    index: string,
    idle: boolean,
    currentTurn: string,
    wagerTxs: WagerTx[],
    redeemedStake: string[],
    redeemedDraw: string[],
}


interface Notification {
    notification: String,
    id: Number,

}



import { writable } from 'svelte/store';

export const connectedAddress = writable<string>();
export const connectedUsername = writable<string>()
export const defaultUsername = writable();

export const isHostAddress = writable()
export const isTwoAddress = writable()


export const isProfile = writable();
export const fetchedProfile = writable<Profile>();
export const avatarSrc = writable<string>('https://f004.backblazeb2.com/file/trxmini-games-/player4.png');
export const profileBadges = writable<Badge[]>([]);
export const trxDomains = writable<Array<string>>()

export const userID = writable<string>(); // Allows users to play with their address or username. If no username, assigns address. 
export const connectedChain = writable(false);

export const getBalance = writable<number>() 

export const playerNotifications = writable<Notification[]>()

export const createPrompt = writable(false)
export const tipPrompt = writable(false)

export const notiPrompt = writable(false)
export const authPrompt = writable(false)
export const avatarPrompt = writable(false)
export const trxPrompt = writable();


export const selectedOption = writable('Chess')
export const inGame = writable(false)
export const medalAlert = writable(false)
export const creatingGame = writable()

// POSTGRES ENDPOINTS
export const url0 = 'http://170.187.182.220:5001/address'
export const url1 = 'http://170.187.182.220:5001/username'
export const url2 = 'http://170.187.182.220:5001/getaddr?username='
export const getXp = 'http://170.187.182.220:5001/getxp?user=' // May not need this.
export const notificationsUrl = 'http://170.187.182.220:5001/getnotifications'
export const getProfileURL = 'http://170.187.182.220:5001/getprofile?user='
export const changeUsernameURL = 'http://170.187.182.220:5001/changeusername'
export const getDomainsURL = `https://app.trxdomains.xyz/api/domains/getDomains?address=`
export const uploadAvatarURL = 'http://170.187.182.220:5001/uploadavatar'
export const getAvatarURL = 'http://170.187.182.220:5001/getavatar'

// REDIS ENDPOINTS


export const makeBallRoom = 'http://172.105.106.183:5020/makeballroom?user='
export const getBallRoomsUrl = 'http://172.105.106.183:5020/getballrooms'

export const urlRooms = 'http://172.105.106.183:5020/rooms'
export const urlEndedRooms = 'http://172.105.106.183:5020/endedrooms'

export const tipSocket = 'http://172.105.106.183:4903/'

// chess contract, aswell as endpoint that Listens for contract events via trongrid.io API, such as the index which is a nessescary parameter to invoke the relevant struct.
export const tipContract = 'TBPL4jVJMwnMLUjmX9GDTgXcC8y3T5zVgD';
export const chessContract = 'TMGBGionnPs1TFRHxNrZRiGneZaDi6zkBh'
export const _chessContract  = 'TQyY41mqbHVWWHWt5Zq1pPL5rYd7HgM2kE'
export const trxDomainContract = 'TAtgoVq9xqv1C65hjFTerJQZFt4rbAPea6'

export const chessEventListener = `https://api.shasta.trongrid.io/v1/contracts/${chessContract}/events` 

export const eventAPI = 'http://172.105.106.183:5020/api'
 
// Chess socket.io endpoint
export const chessWs = 'http://172.105.106.183:3001';

export const currentState = writable('') // Saves current FEN state of chess game.
export const wagerTx = writable<String>()
export const theRoom = writable()
let prompted = false


export async function createGameForm() { // Create game prompt state sharing between components
    prompted = !prompted
    createPrompt.set(prompted)
}


let isTipExpanded = false
export async function tipPlayerForm() {
    isTipExpanded = !isTipExpanded
    console.log(isTipExpanded)
    tipPrompt.set(isTipExpanded)
}


let authExpanded = false
export function myProfile() {
    authExpanded = !authExpanded
    authPrompt.set(authExpanded)
}

let notificationExpanded = false
export function notificationPrompt() {
    notificationExpanded = !notificationExpanded
    notiPrompt.set(notificationExpanded)
}

let avatarExpanded = false
export function expandAvatarPrompt() {
    avatarExpanded = !avatarExpanded
    avatarPrompt.set(avatarExpanded)
}

export async function postRequest(url:string, body:BodyInit) {
    const res = await fetch(url, {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: body,
    })
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
    return await res.json()
} 

export async function getDomains(address:String) {
    let domains
    let url = getDomainsURL + address + `&network=mainnet`
    const res = await fetch(url)
    if (!res.ok) throw new Error (`${res.status}: ${res.statusText}`)
    domains = await res.json()
    console.log(domains.data)
    trxDomains.set(domains.data)
}

// TEST
// async function postImageRequest(url, image) {
//     const formData = new FormData();
//     let blob = new Blob(image)
//     formData.append('image', blob,'image/png')
//     console.log('fdsfdsfdshfddgd3283245832548325825')
//     const res = await fetch(uploadAvatarURL, {
//         method: 'POST',
//         // headers: {'Content Type': 'multipart/form-data'},
//         body: formData,
//     })
//     console.log('fetched')
//     if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
//     return await res.json()
// }

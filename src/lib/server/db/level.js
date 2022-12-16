export function getLevel(xp) {
    // Remember to keep this correlated with server-side, client-side
    
    let y = 1.275 // Affects required XP increase per level (larger y is, harder )
    let x = 1/(1000 ** (1/y)) // Affects XP per level (larger x is, easier it is to level up for xp)
    const userLevel = (xp ** (1/y))  * x
    return userLevel
}

export const sirvClientID = ''
export const sirvSecret = ''
export const sirvEndpoint = ''

export async function postRequest(url, body) {
    const res = await fetch(url, {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: body,
    })
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
    return await res.json()
} 
export async function getLevel(xp) {
    // Remember to keep this correlated with server-side, client-side
    
    let y = 1.275 // Affects required XP increase per level (larger y is, harder)

    let x = 1/(1000 ** (1/y)) // Affects XP per level (larger x is, easier it is to level up for xp)
    
    const userLevel = (xp ** (1/y))  * x
    return userLevel
}

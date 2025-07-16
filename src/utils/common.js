export async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export const randomNonce = (length = 16) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export function randomInt(arg0, arg1) {
    return Math.floor(Math.random() * (arg1 - arg0 + 1) + arg0)
}

export async function sleepRandom(min = 1000, max = 5000) {
    const randomDelay = Math.floor(Math.random() * (max - min + 1) + min)
    return new Promise(resolve => setTimeout(resolve, randomDelay))
}

export const nextCycle = async () => {
    const hourToNextDay = 24 - new Date().getHours()
    const delay = hourToNextDay + 24 * 60 * 60 * 1000 // Convert hours to milliseconds
    return await sleep(delay)
}

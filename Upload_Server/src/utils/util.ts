const MAX_LENGTH= process.env.NODE_ENV?.trim().toLowerCase() === 'prod' ? 10 : 5

export function generateID(username: string){
    let id =  ""
    const subset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

    for (let i = 0; i < MAX_LENGTH; i++) {
        id += subset.charAt(Math.floor(Math.random() * subset.length))
    }
    return `${id}_${username}`;
}
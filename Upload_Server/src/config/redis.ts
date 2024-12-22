import { createClient } from "redis";
import dotenv from "dotenv"
dotenv.config()

const mode = process.env.NODE_ENV?.trim()
const devUrl = "redis://localhost:6379"
const prodUrl = `redis://${process.env.REDIS_HOST}:6379`


export const subscriber = createClient({
    url: mode === 'prod' ? prodUrl : devUrl
})

subscriber.connect();

subscriber.on('connect', () => {
    console.log(`Redis client connected successfully with ${process.env.NODE_ENV?.trim()} mode.`);
});

// Listen for errors to handle connection issues
subscriber.on('error', (err) => {
    console.error('Redis connection error:', err);
});
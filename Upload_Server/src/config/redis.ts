import { createClient } from "redis";
import dotenv from "dotenv"
dotenv.config()

const mode = process.env.NODE_ENV?.trim()
const devUrl = "redis://localhost:6379"
const prodUrl = `redis://${process.env.REDIS_HOST}:6379`


export const publisher = createClient({
    url: mode === 'prod' ? prodUrl : devUrl
})

publisher.connect();

publisher.on('connect', () => {
    console.log(`Redis client connected successfully in ${process.env.NODE_ENV?.trim() === 'prod' ? 'Production' : "Development"} mode.`);
});

// Listen for errors to handle connection issues
publisher.on('error', (err) => {
    console.error('Redis connection error:', err);
});
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
    console.log(`[REDIS] Client connected successfully in ${process.env.NODE_ENV?.trim() === 'prod' ? 'Production' : "Development"} mode.`);
});

// Listen for errors to handle connection issues
publisher.on('error', (err) => {
    console.error('[REDIS] Connection error:', err);
});


export const subscriber = createClient({
    url: mode === 'prod' ? prodUrl : devUrl
})

subscriber.connect();

subscriber.on('connect', () => {
    console.log(`[REDIS] Subscriber client connected successfully in ${process.env.NODE_ENV?.trim() === 'prod' ? 'Production' : "Development"} mode.`);
});

// Listen for errors to handle connection issues
subscriber.on('error', (err) => {
    console.error('[REDIS] Subscriber connection error:', err);
});
import express from 'express';
import dotenv from 'dotenv';
import router from './routes/router';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(router)

const port = process.env.PORT
const mode = process.env.NODE_ENV?.trim().toUpperCase()

app.listen(port, ()=>{
    console.log(`[Server] Started in ${mode} mode on port: ${port}`);  
})
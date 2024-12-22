import express from 'express';
import dotenv from 'dotenv';
import router from './routes/router';

dotenv.config();

const app = express();

app.use(router)

const port = process.env.PORT
const mode = process.env.NODE_ENV?.trim()

app.listen(port, ()=>{
    console.log(`Mode: ${mode}, Port: ${port}`);  
})
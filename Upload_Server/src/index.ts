import express from 'express';
import dotenv from 'dotenv';
import router from './routes/router';
import cors from 'cors';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(router)

const port = process.env.PORT
const mode = process.env.NODE_ENV?.trim()

app.listen(port, ()=>{
    console.log(`Mode: ${mode}, Port: ${port}`);  
})
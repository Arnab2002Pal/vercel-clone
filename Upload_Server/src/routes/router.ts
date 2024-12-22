import express from 'express';
import { 
    test,
    deploy
 } from '../controllers/controller';

const router = express.Router();

router.get('/', test)

router.post('/deploy', deploy)

export default router
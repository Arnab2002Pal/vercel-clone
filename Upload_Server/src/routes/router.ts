import express from 'express';
import { 
    test,
    deploy,
    status
 } from '../controllers/controller';

const router = express.Router();

router.get('/', test)
router.get('/status', status)

router.post('/deploy', deploy)

export default router
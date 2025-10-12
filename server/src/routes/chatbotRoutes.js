import express from 'express';
import { postQueryToGemini } from '../controllers/chatbotController.js';

const router = express.Router();

router.post('/', postQueryToGemini);

export default router;

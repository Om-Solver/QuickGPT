import express from 'express';
import { protect } from '../middlewares/auth.js';
import { imageMessageController, textMessageController } from '../controllers/messageController.js';
import { geminiLimiter, imagekitLimiter } from '../middlewares/rateLimiter.js';

const messageRouter = express.Router()

messageRouter.post('/text', protect, geminiLimiter, textMessageController)
messageRouter.post('/image', protect, imagekitLimiter, imageMessageController)

export default messageRouter;
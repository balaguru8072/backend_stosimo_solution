import express from 'express';
import { sendMessage, getAllMessages, getSingleMessage,deleteMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// PUBLIC - yaarum anuppalama (form la irunthu varathu)
router.post('/send', sendMessage);

// PROTECTED - login panna admin mattum paakkalam / delete pannalam
router.get('/all', protect, getAllMessages);
router.get('/:id', protect, getSingleMessage); // <-- ITHU NEW
router.delete('/:id', protect, deleteMessage);

export default router;
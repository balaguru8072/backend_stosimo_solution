import express from 'express';
import {
    submitServiceMessage,
    getServiceMessages,
    getServiceMessage,
    updateServiceMessageStatus,
    deleteServiceMessage
} from '../controllers/serviceMessageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .post(submitServiceMessage)
    .get(protect, getServiceMessages);

router.route('/:id')
    .get(protect, getServiceMessage)
    .put(protect, updateServiceMessageStatus)
    .delete(protect, deleteServiceMessage);;

export default router;
import express from 'express';
import {
    getServices,
    getService, // ✅ Itha add pannu
    createService,
    updateService,
    deleteService
} from '../controllers/serviceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(getServices)
    .post(protect, createService);

router.route('/:id')
    .get(getService) // ✅ Itha add pannu
    .put(protect, updateService)
    .delete(protect, deleteService);

export default router;
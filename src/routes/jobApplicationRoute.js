import express from 'express';
import {
    submitApplication,
    getApplications,
    updateApplicationStatus,
    deleteApplication
} from '../controllers/jobApplicationController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.route('/')
   .get(protect, getApplications) // Admin only
   .post(upload.fields([{ name: 'resume', maxCount: 1 }]), submitApplication); // Public

router.route('/:id')
   .put(protect, updateApplicationStatus)
   .delete(protect, deleteApplication);

export default router;
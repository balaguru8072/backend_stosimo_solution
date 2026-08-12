import express from 'express';
import {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js'; // Idhu import pannirukingala?

const router = express.Router();

router.route('/')
  .get(getProjects)
  .post(protect, upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'images', maxCount: 5 }
    ]), createProject); // Indha middleware mukkiyam

router.route('/:id')
  .get(getProject)
  .put(protect, upload.fields([
        { name: 'image', maxCount: 1 },
        { name: 'images', maxCount: 5 }
    ]), updateProject)
  .delete(protect, deleteProject);

export default router;
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getResumeUploader } from '../services/storageService.js';
import { getMe, updateMe, uploadResume, deleteResume, setDefaultResume } from '../controllers/userController.js';

const router = express.Router();

router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);
router.post('/me/resumes', authMiddleware, getResumeUploader().single('file'), uploadResume);
router.delete('/me/resumes/:index', authMiddleware, deleteResume);
router.put('/me/resumes/default', authMiddleware, setDefaultResume);

export default router;



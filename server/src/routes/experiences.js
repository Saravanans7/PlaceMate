import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { createExperience, listExperiences, approveExperience, rejectExperience, deleteExperience } from '../controllers/experienceController.js';

const router = express.Router();

router.get('/', listExperiences);
router.post('/', authMiddleware, roleMiddleware('student'), createExperience);
router.post('/:id/approve', authMiddleware, roleMiddleware('staff'), approveExperience);
router.post('/:id/reject', authMiddleware, roleMiddleware('staff'), rejectExperience);
router.delete('/:id', authMiddleware, roleMiddleware('staff'), deleteExperience);

export default router;



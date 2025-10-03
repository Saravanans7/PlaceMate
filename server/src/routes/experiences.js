import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { createExperience, listExperiences, approveExperience, deleteExperience } from '../controllers/experienceController.js';

const router = express.Router();

router.get('/', listExperiences);
router.post('/', authMiddleware, roleMiddleware('student'), createExperience);
router.put('/:id/approve', authMiddleware, roleMiddleware('staff'), approveExperience);
router.delete('/:id', authMiddleware, roleMiddleware('staff'), deleteExperience);

export default router;



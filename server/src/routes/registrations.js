import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { createRegistration, listRegistrations, getRegistration, updateRegistration, deleteRegistration } from '../controllers/registrationController.js';

const router = express.Router();

router.get('/', listRegistrations);
router.get('/:id', getRegistration);
router.post('/', authMiddleware, roleMiddleware('staff'), createRegistration);
router.put('/:id', authMiddleware, roleMiddleware('staff'), updateRegistration);
router.delete('/:id', authMiddleware, roleMiddleware('staff'), deleteRegistration);

export default router;



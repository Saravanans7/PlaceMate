import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { eligibilityMiddleware } from '../middleware/eligibility.js';
import Registration from '../models/Registration.js';
import { applyToRegistration, listMyApplications, listApplicants } from '../controllers/applicationController.js';

const router = express.Router();

router.post(
  '/registrations/:id/apply',
  authMiddleware,
  roleMiddleware('student'),
  eligibilityMiddleware(async (req) => Registration.findById(req.params.id)),
  applyToRegistration
);

router.get('/users/:id/applications', authMiddleware, listMyApplications);
router.get('/registrations/:id/applicants', authMiddleware, roleMiddleware('staff'), listApplicants);

export default router;



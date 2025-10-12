import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { listDrives, createDrive, getDrive, getDriveWithStudentProgress, addAnnouncement, shortlistRound, roundResults, finalizeDrive, backfillTodayDrives, getOrCreateDriveByRegistration, updateDrive, deleteDrive } from '../controllers/driveController.js';

const router = express.Router();

router.get('/', authMiddleware, listDrives);
router.post('/', authMiddleware, roleMiddleware('staff'), createDrive);
router.get('/by-registration/:id', authMiddleware, roleMiddleware('staff'), getOrCreateDriveByRegistration);
router.post('/backfill-today', authMiddleware, roleMiddleware('staff'), backfillTodayDrives);
router.get('/student/:companyName', authMiddleware, getDriveWithStudentProgress);
router.get('/:id', authMiddleware, getDrive);
router.post('/:id/announcement', authMiddleware, roleMiddleware('staff'), addAnnouncement);
router.post('/:id/rounds/:roundIndex/shortlist', authMiddleware, roleMiddleware('staff'), shortlistRound);
router.post('/:id/rounds/:roundIndex/results', authMiddleware, roleMiddleware('staff'), roundResults);
router.post('/:id/finalize', authMiddleware, roleMiddleware('staff'), finalizeDrive);
router.put('/:id', authMiddleware, roleMiddleware('staff'), updateDrive);
router.delete('/:id', authMiddleware, roleMiddleware('staff'), deleteDrive);

export default router;



import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { 
  addToBlacklist, 
  removeFromBlacklist, 
  getBlacklistedStudents, 
  searchStudents 
} from '../controllers/blacklistController.js';

const router = express.Router();

// All routes require staff authentication
router.use(authMiddleware);
router.use(roleMiddleware('staff'));

// Get blacklisted students
router.get('/', getBlacklistedStudents);

// Search students for blacklisting
router.get('/search', searchStudents);

// Add student to blacklist
router.post('/', addToBlacklist);

// Remove student from blacklist
router.post('/remove', removeFromBlacklist);

export default router;

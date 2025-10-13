import express from 'express';
import multer from 'multer';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import {
  getMe,
  updateMe,
  getPlacementInfo,
  listStudents,
  createStudent,
  getStudent,
  updateStudent,
  deleteStudent,
  bulkCreateStudents
} from '../controllers/userController.js';

const router = express.Router();

// Multer for Excel uploads (store in memory)
const excelUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get('/me', authMiddleware, getMe);
router.get('/me/placement', authMiddleware, getPlacementInfo);
router.put('/me', authMiddleware, updateMe);

// Staff-only routes for student management
router.get('/students', authMiddleware, roleMiddleware('staff'), listStudents);
router.post('/students', authMiddleware, roleMiddleware('staff'), createStudent);
router.post('/students/bulk', authMiddleware, roleMiddleware('staff'), excelUpload.single('file'), bulkCreateStudents);
router.get('/students/:id', authMiddleware, roleMiddleware('staff'), getStudent);
router.put('/students/:id', authMiddleware, roleMiddleware('staff'), updateStudent);
router.delete('/students/:id', authMiddleware, roleMiddleware('staff'), deleteStudent);

export default router;



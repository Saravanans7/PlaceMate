import express from 'express';
import User from '../models/User.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/batches', authMiddleware, roleMiddleware('staff'), async (req, res, next) => {
  try {
    const pipeline = [
      { $match: { role: 'student' } },
      { 
        $group: { 
          _id: '$batch', 
          total: { $sum: 1 },
          placed: { $sum: { $cond: ['$isPlaced', 1, 0] } }
        } 
      },
      { $sort: { _id: -1 } },
    ];
    const data = await User.aggregate(pipeline);
    res.json({ success: true, data });
  } catch (e) { next(e); }
});

export default router;



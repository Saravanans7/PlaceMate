import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import { listCompanies, getCompany, createCompany, updateCompany, deleteCompany } from '../controllers/companyController.js';

const router = express.Router();

router.get('/', listCompanies);
router.get('/:id', getCompany);
router.post('/', authMiddleware, roleMiddleware('staff'), createCompany);
router.put('/:id', authMiddleware, roleMiddleware('staff'), updateCompany);
router.delete('/:id', authMiddleware, roleMiddleware('staff'), deleteCompany);

export default router;



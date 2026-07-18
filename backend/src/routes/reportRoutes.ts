import { Router } from 'express';
import { getReportData } from '../controllers/reportController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Protect all report routes
router.use(protect as any);

router.get('/', authorizeRoles('Admin', 'Inventory Manager') as any, getReportData as any);

export default router;

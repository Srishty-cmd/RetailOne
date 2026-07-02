import { Router } from 'express';
import { getStores, createStore } from '../controllers/storeController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(protect as any);

router.route('/')
  .get(getStores as any)
  .post(authorizeRoles('Admin') as any, createStore as any);

export default router;

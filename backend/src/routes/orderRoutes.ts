import { Router } from 'express';
import { getOrders, createOrder } from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect as any);

router.route('/')
  .get(getOrders as any)
  .post(createOrder as any);

export default router;

import { Router } from 'express';
import { 
  getOrders, 
  createOrder, 
  getOrderById, 
  updateOrderStatus, 
  deleteOrder, 
  getOrderStats 
} from '../controllers/orderController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect as any);

router.get('/stats', getOrderStats as any);

router.route('/')
  .get(getOrders as any)
  .post(createOrder as any);

router.route('/:id')
  .get(getOrderById as any)
  .delete(deleteOrder as any);

router.route('/:id/status')
  .put(updateOrderStatus as any);

export default router;

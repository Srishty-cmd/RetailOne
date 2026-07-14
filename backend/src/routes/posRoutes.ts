import { Router } from 'express';
import { 
  getPOSProducts,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  checkout
} from '../controllers/posController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Secure all POS endpoints using auth protect middleware
router.use(protect as any);

router.get('/products', getPOSProducts as any);
router.get('/cart', getCart as any);
router.post('/cart', addToCart as any);
router.put('/cart/:id', updateCartItem as any);
router.delete('/cart/:id', removeFromCart as any);
router.post('/checkout', checkout as any);

export default router;

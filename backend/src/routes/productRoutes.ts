import { Router } from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Protect all routes
router.use(protect as any);

router.route('/')
  .get(getProducts as any)
  .post(authorizeRoles('Admin', 'Inventory Manager') as any, createProduct as any);

router.route('/:id')
  .get(getProductById as any)
  .put(authorizeRoles('Admin', 'Inventory Manager') as any, updateProduct as any)
  .delete(authorizeRoles('Admin') as any, deleteProduct as any);

export default router;

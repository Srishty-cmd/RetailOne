import { Router } from 'express';
import { 
  getInventoryItems, 
  getInventoryItemById, 
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem, 
  stockIn, 
  stockOut, 
  getInventoryHistory 
} from '../controllers/inventoryController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Protect all routes
router.use(protect as any);

router.route('/')
  .get(getInventoryItems as any)
  .post(authorizeRoles('Admin', 'Inventory Manager') as any, createInventoryItem as any);

router.route('/stock-in')
  .post(authorizeRoles('Admin', 'Inventory Manager') as any, stockIn as any);

router.route('/stock-out')
  .post(authorizeRoles('Admin', 'Inventory Manager') as any, stockOut as any);

router.route('/history/:productId')
  .get(getInventoryHistory as any);

router.route('/:id')
  .get(getInventoryItemById as any)
  .put(authorizeRoles('Admin', 'Inventory Manager') as any, updateInventoryItem as any)
  .delete(authorizeRoles('Admin') as any, deleteInventoryItem as any);

export default router;

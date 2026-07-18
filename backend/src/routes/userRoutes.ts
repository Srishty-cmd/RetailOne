import { Router } from 'express';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus, 
  resetPasswordPlaceholder 
} from '../controllers/userController';
import { protect, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Protect all routes and allow Admins only
router.use(protect as any);
router.use(authorizeRoles('Admin') as any);

router.route('/')
  .get(getUsers as any)
  .post(createUser as any);

router.route('/:id')
  .put(updateUser as any)
  .delete(deleteUser as any);

router.patch('/:id/status', toggleUserStatus as any);
router.patch('/:id/reset-password', resetPasswordPlaceholder as any);

export default router;

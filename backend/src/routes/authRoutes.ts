import { Router } from 'express';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  refreshAccessToken, 
  getUserProfile,
  forgotPassword,
  resetPassword
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/profile', protect as any, getUserProfile as any);

export default router;

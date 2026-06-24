import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your_access_token_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_token_secret_key';
const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRY = '7d'; // Long-lived refresh token

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

// Generate JWT Access Token
const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

// Generate JWT Refresh Token
const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

// Set HTTP-only Cookie for Refresh Token
const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { name, email, password, role, storeId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Strong password validation
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }

    const validRoles = ['Admin', 'Inventory Manager', 'Cashier'];
    const assignedRole = role || 'Cashier';
    if (!validRoles.includes(assignedRole)) {
      return res.status(400).json({ message: `Invalid role. Allowed: ${validRoles.join(', ')}` });
    }

    const user = await User.create({
      name,
      email,
      password, // Automatically hashed via pre-save hook in User model
      role: assignedRole,
      store: storeId || null
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user._id.toString(), user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const newAccessToken = generateAccessToken(user._id.toString(), user.role);

    res.status(200).json({
      success: true,
      token: newAccessToken
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - Request Reset Link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide email address' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with that email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set in user document
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set token expiration (1 hour)
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000);

    await user.save();

    // Log the link in development console
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    console.log('\n======================================================');
    console.log('PASSWORD RESET LINK GENERATED (DEVELOPMENT):');
    console.log(resetUrl);
    console.log('======================================================\n');

    res.status(200).json({
      success: true,
      message: 'Password reset link generated and logged to console.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      return res.status(400).json({ message: 'Please provide new password' });
    }

    // Validate strong password
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.'
      });
    }

    // Hash token to compare with DB hashed token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token as string)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    // Set new password (pre-save hook will hash it automatically)
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful.'
    });
  } catch (error) {
    next(error);
  }
};


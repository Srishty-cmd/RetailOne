import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../controllers/authController';

const JWT_SECRET = process.env.JWT_SECRET || 'your_access_token_secret_key';

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

      req.user = {
        userId: decoded.userId,
        role: decoded.role
      };

      return next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Role-Based Access Control (RBAC) middleware
export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: User role '${req.user.role}' is not authorized to access this resource`
      });
    }

    next();
  };
};

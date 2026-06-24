"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your_access_token_secret_key';
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.user = {
                userId: decoded.userId,
                role: decoded.role
            };
            return next();
        }
        catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};
exports.protect = protect;
// Role-Based Access Control (RBAC) middleware
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
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
exports.authorizeRoles = authorizeRoles;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityMiddleware = void 0;
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const corsOptions = {
    origin: (origin, callback) => {
        // Mirror the request origin to support credentials (HttpOnly cookies)
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};
exports.securityMiddleware = [
    (0, helmet_1.default)(),
    (0, cors_1.default)(corsOptions)
];

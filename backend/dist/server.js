"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const db_1 = __importDefault(require("./config/db"));
const redis_1 = require("./config/redis");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const healthRoutes_1 = __importDefault(require("./routes/healthRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const inventoryRoutes_1 = __importDefault(require("./routes/inventoryRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const storeRoutes_1 = __importDefault(require("./routes/storeRoutes"));
const posRoutes_1 = __importDefault(require("./routes/posRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/reportRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const loggerMiddleware_1 = require("./middleware/loggerMiddleware");
const securityMiddleware_1 = require("./middleware/securityMiddleware");
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const seed_1 = require("./scripts/seed");
const app = (0, express_1.default)();
// Middlewares
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(loggerMiddleware_1.loggerMiddleware);
app.use(securityMiddleware_1.securityMiddleware); // Helmet and CORS configured for credentials
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/health', healthRoutes_1.default);
app.use('/api/products', productRoutes_1.default);
app.use('/api/inventory', inventoryRoutes_1.default);
app.use('/api/dashboard', dashboardRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/api/stores', storeRoutes_1.default);
app.use('/api/pos', posRoutes_1.default);
app.use('/api/reports', reportRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
// Root Endpoint
app.get('/', (req, res) => {
    res.send('RetailOne API is running (TypeScript)...');
});
// Global Error Handler
app.use(errorMiddleware_1.errorMiddleware);
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        // Connect MongoDB
        await (0, db_1.default)();
        // Auto-seed database (Store and Accounts) if needed
        await (0, seed_1.seedDatabase)();
        // Connect Redis (enabled for containers)
        await (0, redis_1.connectRedis)();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};
startServer();

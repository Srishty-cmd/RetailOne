"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_1 = require("../controllers/reportController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Protect all report routes
router.use(authMiddleware_1.protect);
router.get('/', (0, authMiddleware_1.authorizeRoles)('Admin', 'Inventory Manager'), reportController_1.getReportData);
exports.default = router;

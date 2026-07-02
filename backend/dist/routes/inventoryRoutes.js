"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventoryController_1 = require("../controllers/inventoryController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Protect all routes
router.use(authMiddleware_1.protect);
router.route('/')
    .get(inventoryController_1.getInventoryItems)
    .post((0, authMiddleware_1.authorizeRoles)('Admin', 'Inventory Manager'), inventoryController_1.createInventoryItem);
router.route('/stock-in')
    .post((0, authMiddleware_1.authorizeRoles)('Admin', 'Inventory Manager'), inventoryController_1.stockIn);
router.route('/stock-out')
    .post((0, authMiddleware_1.authorizeRoles)('Admin', 'Inventory Manager'), inventoryController_1.stockOut);
router.route('/history/:productId')
    .get(inventoryController_1.getInventoryHistory);
router.route('/:id')
    .get(inventoryController_1.getInventoryItemById)
    .put((0, authMiddleware_1.authorizeRoles)('Admin', 'Inventory Manager'), inventoryController_1.updateInventoryItem)
    .delete((0, authMiddleware_1.authorizeRoles)('Admin'), inventoryController_1.deleteInventoryItem);
exports.default = router;

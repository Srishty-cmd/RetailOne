"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/stats', orderController_1.getOrderStats);
router.route('/')
    .get(orderController_1.getOrders)
    .post(orderController_1.createOrder);
router.route('/:id')
    .get(orderController_1.getOrderById)
    .delete(orderController_1.deleteOrder);
router.route('/:id/status')
    .put(orderController_1.updateOrderStatus);
exports.default = router;

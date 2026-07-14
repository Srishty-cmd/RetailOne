"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const posController_1 = require("../controllers/posController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Secure all POS endpoints using auth protect middleware
router.use(authMiddleware_1.protect);
router.get('/products', posController_1.getPOSProducts);
router.get('/cart', posController_1.getCart);
router.post('/cart', posController_1.addToCart);
router.put('/cart/:id', posController_1.updateCartItem);
router.delete('/cart/:id', posController_1.removeFromCart);
router.post('/checkout', posController_1.checkout);
exports.default = router;

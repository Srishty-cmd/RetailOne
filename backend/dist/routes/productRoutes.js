"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Protect all routes
router.use(authMiddleware_1.protect);
router.route('/')
    .get(productController_1.getProducts)
    .post((0, authMiddleware_1.authorizeRoles)('Admin', 'Inventory Manager'), productController_1.createProduct);
router.route('/:id')
    .get(productController_1.getProductById)
    .put((0, authMiddleware_1.authorizeRoles)('Admin', 'Inventory Manager'), productController_1.updateProduct)
    .delete((0, authMiddleware_1.authorizeRoles)('Admin'), productController_1.deleteProduct);
exports.default = router;

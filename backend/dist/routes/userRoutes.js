"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Protect all routes and allow Admins only
router.use(authMiddleware_1.protect);
router.use((0, authMiddleware_1.authorizeRoles)('Admin'));
router.route('/')
    .get(userController_1.getUsers)
    .post(userController_1.createUser);
router.route('/:id')
    .put(userController_1.updateUser)
    .delete(userController_1.deleteUser);
router.patch('/:id/status', userController_1.toggleUserStatus);
router.patch('/:id/reset-password', userController_1.resetPasswordPlaceholder);
exports.default = router;

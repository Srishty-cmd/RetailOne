"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storeController_1 = require("../controllers/storeController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.route('/')
    .get(storeController_1.getStores)
    .post((0, authMiddleware_1.authorizeRoles)('Admin'), storeController_1.createStore);
exports.default = router;

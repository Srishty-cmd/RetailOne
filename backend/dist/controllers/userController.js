"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordPlaceholder = exports.toggleUserStatus = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
// @desc    Get all users with search, filter and pagination
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
    try {
        const search = req.query.search;
        const role = req.query.role;
        const status = req.query.status;
        const store = req.query.store;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) {
            query.role = role;
        }
        if (status) {
            query.status = status;
        }
        if (store) {
            query.store = store;
        }
        const totalUsers = await User_1.default.countDocuments(query);
        const users = await User_1.default.find(query)
            .populate('store', 'name code')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        // Calculate Summary Stats
        const total = await User_1.default.countDocuments();
        const admins = await User_1.default.countDocuments({ role: 'Admin' });
        const managers = await User_1.default.countDocuments({ role: 'Inventory Manager' });
        const cashiers = await User_1.default.countDocuments({ role: 'Cashier' });
        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    total: totalUsers,
                    page,
                    limit,
                    pages: Math.ceil(totalUsers / limit)
                },
                summary: {
                    total,
                    admins,
                    managers,
                    cashiers
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUsers = getUsers;
// @desc    Create new user/staff member
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res, next) => {
    try {
        const { name, email, password, role, store, phone, status } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields (name, email, password)' });
        }
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        const user = await User_1.default.create({
            name,
            email,
            password,
            role: role || 'Cashier',
            store: store || null,
            phone: phone || '',
            status: status || 'Active'
        });
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createUser = createUser;
// @desc    Update user details
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res, next) => {
    try {
        const { name, email, role, store, phone, status, password } = req.body;
        const userId = req.params.id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check email uniqueness if email is being changed
        if (email && email !== user.email) {
            const emailExists = await User_1.default.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email is already taken by another user' });
            }
        }
        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        user.store = store === undefined ? user.store : (store === '' ? null : store);
        user.phone = phone !== undefined ? phone : user.phone;
        user.status = status || user.status;
        if (password && password.trim() !== '') {
            user.password = password;
        }
        await user.save();
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                phone: user.phone
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUser = updateUser;
// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        // Prevent user deleting themselves
        if (req.user?.userId === userId) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await User_1.default.findByIdAndDelete(userId);
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
// @desc    Toggle user active/inactive status
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { status } = req.body;
        if (!status || !['Active', 'Inactive'].includes(status)) {
            return res.status(400).json({ message: 'Please provide a valid status (Active or Inactive)' });
        }
        // Prevent user deactivating themselves
        if (req.user?.userId === userId) {
            return res.status(400).json({ message: 'You cannot deactivate your own account' });
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.status = status;
        await user.save();
        res.status(200).json({
            success: true,
            message: `User account is now ${status === 'Active' ? 'activated' : 'deactivated'}`
        });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleUserStatus = toggleUserStatus;
// @desc    Reset password (Placeholder)
// @route   PATCH /api/users/:id/reset-password
// @access  Private/Admin
const resetPasswordPlaceholder = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { newPassword } = req.body;
        if (!newPassword || newPassword.trim().length < 6) {
            return res.status(400).json({ message: 'Please provide a new password of at least 6 characters' });
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: 'User password reset successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPasswordPlaceholder = resetPasswordPlaceholder;

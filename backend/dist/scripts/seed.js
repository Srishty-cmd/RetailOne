"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const User_1 = __importDefault(require("../models/User"));
const Store_1 = __importDefault(require("../models/Store"));
const seedDatabase = async () => {
    try {
        // 1. Seed Store if none exists
        let store = await Store_1.default.findOne({ code: 'STR001' });
        if (!store) {
            store = await Store_1.default.create({
                name: 'Flagship Store',
                code: 'STR001',
                address: '123 Tech Avenue, Bengaluru, KA',
                phone: '080-12345678',
                isActive: true
            });
            console.log('Seeded Flagship Store (STR001)');
        }
        // 2. Seed Admin User if none exists
        const adminEmail = 'admin@storesync.com';
        const adminExists = await User_1.default.findOne({ email: adminEmail });
        if (!adminExists) {
            await User_1.default.create({
                name: 'System Admin',
                email: adminEmail,
                password: 'password123', // Automatically hashed via pre-save hook
                role: 'Admin',
                store: store._id
            });
            console.log(`Seeded Admin Account: ${adminEmail} / password123`);
        }
        // 3. Seed Cashier User if none exists
        const cashierEmail = 'cashier@storesync.com';
        const cashierExists = await User_1.default.findOne({ email: cashierEmail });
        if (!cashierExists) {
            await User_1.default.create({
                name: 'Riya Cashier',
                email: cashierEmail,
                password: 'password123',
                role: 'Cashier',
                store: store._id
            });
            console.log(`Seeded Cashier Account: ${cashierEmail} / password123`);
        }
        // 4. Seed Inventory Manager User if none exists
        const managerEmail = 'manager@storesync.com';
        const managerExists = await User_1.default.findOne({ email: managerEmail });
        if (!managerExists) {
            await User_1.default.create({
                name: 'Manager User',
                email: managerEmail,
                password: 'password123',
                role: 'Inventory Manager',
                store: store._id
            });
            console.log(`Seeded Inventory Manager Account: ${managerEmail} / password123`);
        }
    }
    catch (error) {
        console.error('Error seeding database:', error);
    }
};
exports.seedDatabase = seedDatabase;

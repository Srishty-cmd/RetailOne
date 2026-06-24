import User from '../models/User';
import Store from '../models/Store';

export const seedDatabase = async () => {
  try {
    // 1. Seed Store if none exists
    let store = await Store.findOne({ code: 'STR001' });
    if (!store) {
      store = await Store.create({
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
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
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
    const cashierExists = await User.findOne({ email: cashierEmail });
    if (!cashierExists) {
      await User.create({
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
    const managerExists = await User.findOne({ email: managerEmail });
    if (!managerExists) {
      await User.create({
        name: 'Manager User',
        email: managerEmail,
        password: 'password123',
        role: 'Inventory Manager',
        store: store._id
      });
      console.log(`Seeded Inventory Manager Account: ${managerEmail} / password123`);
    }

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

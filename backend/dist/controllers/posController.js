"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkout = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = exports.getPOSProducts = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const Inventory_1 = __importDefault(require("../models/Inventory"));
const Order_1 = __importDefault(require("../models/Order"));
const OrderItem_1 = __importDefault(require("../models/OrderItem"));
const InventoryLog_1 = __importDefault(require("../models/InventoryLog"));
const Store_1 = __importDefault(require("../models/Store"));
const User_1 = __importDefault(require("../models/User"));
const Cart_1 = __importDefault(require("../models/Cart"));
// Helper to get fully populated cart
const getPopulatedCart = async (userId) => {
    let cart = await Cart_1.default.findOne({ user: userId });
    if (!cart) {
        cart = await Cart_1.default.create({ user: userId, items: [] });
    }
    return await Cart_1.default.findById(cart._id).populate({
        path: 'items.product',
        select: 'productName sku barcode category sellingPrice quantity image minimumStock status'
    });
};
// @desc    Search available products for POS
// @route   GET /api/pos/products
// @access  Private
const getPOSProducts = async (req, res, next) => {
    try {
        const { search, category, barcode } = req.query;
        const query = { status: 'Active' };
        if (barcode) {
            query.barcode = barcode;
        }
        else if (search) {
            query.$or = [
                { productName: { $regex: search, $options: 'i' } },
                { sku: { $regex: search, $options: 'i' } },
                { barcode: { $regex: search, $options: 'i' } }
            ];
        }
        if (category && category !== 'All') {
            query.category = category;
        }
        // Limit active POS catalog to 100 items for responsive lookups
        const products = await Product_1.default.find(query).sort({ productName: 1 }).limit(100);
        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPOSProducts = getPOSProducts;
// @desc    Get cashier cart
// @route   GET /api/pos/cart
// @access  Private
const getCart = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const cart = await getPopulatedCart(req.user.userId);
        res.status(200).json({ success: true, data: cart });
    }
    catch (error) {
        next(error);
    }
};
exports.getCart = getCart;
// @desc    Add product to cart
// @route   POST /api/pos/cart
// @access  Private
const addToCart = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const { product: productId, quantity } = req.body;
        if (!productId || typeof quantity !== 'number' || quantity <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid product or quantity' });
        }
        // Check product exists and is active
        const product = await Product_1.default.findById(productId);
        if (!product || product.status !== 'Active') {
            return res.status(404).json({ success: false, message: 'Product not found or is inactive' });
        }
        // Validate available stock
        const inventory = await Inventory_1.default.findOne({ product: productId });
        const currentStock = inventory ? inventory.currentStock : product.quantity;
        if (currentStock <= 0) {
            return res.status(400).json({ success: false, message: 'Product is out of stock' });
        }
        // Get cart
        let cart = await Cart_1.default.findOne({ user: req.user.userId });
        if (!cart) {
            cart = await Cart_1.default.create({ user: req.user.userId, items: [] });
        }
        // Check if item is already in cart
        const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
        let requestedQuantity = quantity;
        if (itemIndex > -1) {
            requestedQuantity += cart.items[itemIndex].quantity;
            if (currentStock < requestedQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more units. Available stock: ${currentStock}, cart currently has: ${cart.items[itemIndex].quantity}`
                });
            }
            cart.items[itemIndex].quantity = requestedQuantity;
        }
        else {
            if (currentStock < requestedQuantity) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add ${requestedQuantity} units. Available stock: ${currentStock}`
                });
            }
            cart.items.push({ product: productId, quantity: requestedQuantity });
        }
        await cart.save();
        const populatedCart = await getPopulatedCart(req.user.userId);
        res.status(200).json({ success: true, data: populatedCart });
    }
    catch (error) {
        next(error);
    }
};
exports.addToCart = addToCart;
// @desc    Update cart item quantity
// @route   PUT /api/pos/cart/:id
// @access  Private
const updateCartItem = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const productId = req.params.id;
        const { quantity } = req.body;
        if (typeof quantity !== 'number' || quantity <= 0) {
            return res.status(400).json({ success: false, message: 'Quantity must be a positive number' });
        }
        // Check product and stock
        const product = await Product_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const inventory = await Inventory_1.default.findOne({ product: productId });
        const currentStock = inventory ? inventory.currentStock : product.quantity;
        if (currentStock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient stock level. Available stock: ${currentStock}, requested: ${quantity}`
            });
        }
        const cart = await Cart_1.default.findOne({ user: req.user.userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }
        const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }
        cart.items[itemIndex].quantity = quantity;
        await cart.save();
        const populatedCart = await getPopulatedCart(req.user.userId);
        res.status(200).json({ success: true, data: populatedCart });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCartItem = updateCartItem;
// @desc    Remove cart item
// @route   DELETE /api/pos/cart/:id
// @access  Private
const removeFromCart = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const productId = req.params.id;
        const cart = await Cart_1.default.findOne({ user: req.user.userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }
        cart.items = cart.items.filter((item) => item.product.toString() !== productId);
        await cart.save();
        const populatedCart = await getPopulatedCart(req.user.userId);
        res.status(200).json({ success: true, data: populatedCart });
    }
    catch (error) {
        next(error);
    }
};
exports.removeFromCart = removeFromCart;
// @desc    Checkout cashier cart and create Order
// @route   POST /api/pos/checkout
// @access  Private
const checkout = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const { paymentMethod, discount = 0, tax = 0 } = req.body;
        if (!paymentMethod || !['Cash', 'Card', 'UPI'].includes(paymentMethod)) {
            return res.status(400).json({ success: false, message: 'Valid payment method (Cash, Card, UPI) is required' });
        }
        // Get current user cart
        const cart = await Cart_1.default.findOne({ user: req.user.userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Your cart is empty' });
        }
        // 1. Resolve Store
        const cashierUser = await User_1.default.findById(req.user.userId);
        let storeId = cashierUser?.store;
        if (!storeId) {
            const anyStore = await Store_1.default.findOne();
            if (anyStore) {
                storeId = anyStore._id;
            }
            else {
                const defaultStore = await Store_1.default.create({
                    name: 'Main Store',
                    code: 'STR-MAIN',
                    address: 'Default Address',
                    phone: '000-0000000',
                    isActive: true
                });
                storeId = defaultStore._id;
            }
        }
        // 2. Validate stock levels for all products
        for (const item of cart.items) {
            const product = item.product;
            if (!product || product.status !== 'Active') {
                return res.status(400).json({
                    success: false,
                    message: `Product is no longer available or active: ${product ? product.productName : 'Unknown Product'}`
                });
            }
            const inv = await Inventory_1.default.findOne({ product: product._id });
            if (!inv) {
                return res.status(404).json({
                    success: false,
                    message: `Inventory record not found for product: ${product.productName}. Perform Stock In first.`
                });
            }
            if (inv.currentStock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product "${product.productName}". Available: ${inv.currentStock}, requested: ${item.quantity}`
                });
            }
        }
        // 3. Calculate Totals
        let subtotal = 0;
        for (const item of cart.items) {
            const product = item.product;
            subtotal += product.sellingPrice * item.quantity;
        }
        const calculatedTotal = subtotal - discount + tax;
        const finalTotal = calculatedTotal > 0 ? parseFloat(calculatedTotal.toFixed(2)) : 0;
        // 4. Create parent Order document
        const order = await Order_1.default.create({
            store: storeId,
            user: req.user.userId,
            total: finalTotal,
            status: 'Completed',
            paymentMethod,
            subtotal: parseFloat(subtotal.toFixed(2)),
            discount: parseFloat(discount.toFixed(2)),
            tax: parseFloat(tax.toFixed(2))
        });
        const warnings = [];
        // 5. Create OrderItems, deduct stock, log inventory updates
        for (const item of cart.items) {
            const product = item.product;
            // Create order item
            await OrderItem_1.default.create({
                order: order._id,
                product: product._id,
                quantity: item.quantity,
                price: product.sellingPrice
            });
            // Deduct inventory stock
            const inv = await Inventory_1.default.findOne({ product: product._id });
            if (inv) {
                inv.currentStock -= item.quantity;
                await inv.save(); // triggers pre-save which auto-calculates status: Low Stock, Out of Stock, etc.
                // Log stock out transaction
                await InventoryLog_1.default.create({
                    product: product._id,
                    inventory: inv._id,
                    type: 'Stock Out',
                    quantity: item.quantity,
                    remainingStock: inv.currentStock,
                    reason: 'Sales',
                    notes: `POS Transaction checkout - Order ID: ${order._id}`,
                    createdBy: req.user.userId
                });
                // Sync Product collection quantity field
                await Product_1.default.findByIdAndUpdate(product._id, {
                    quantity: inv.currentStock
                });
                // Evaluate stock level warning flags
                if (inv.currentStock === 0) {
                    warnings.push(`Product "${product.productName}" is now OUT OF STOCK!`);
                }
                else if (inv.currentStock <= inv.minimumStock) {
                    warnings.push(`Product "${product.productName}" is running low on stock (${inv.currentStock} units remaining).`);
                }
            }
        }
        // 6. Clear cart
        cart.items = [];
        await cart.save();
        // 7. Retrieve fully populated invoice data
        const populatedOrder = await Order_1.default.findById(order._id)
            .populate('store', 'name code address phone')
            .populate('user', 'name email');
        const populatedItems = await OrderItem_1.default.find({ order: order._id }).populate('product', 'productName sku barcode category');
        res.status(201).json({
            success: true,
            order: populatedOrder,
            items: populatedItems,
            warnings
        });
    }
    catch (error) {
        next(error);
    }
};
exports.checkout = checkout;

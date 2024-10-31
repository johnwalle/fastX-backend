const { Schema, model } = require("mongoose");

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    cartId: {
        type: Schema.Types.ObjectId,
        ref: 'Cart',
        required: true
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    restaurantName: {
        type: String,
        required: true
    },
    OrderItems: [{
        menuItem: {
            type: Schema.Types.ObjectId,
            ref: 'Menu',
            required: true
        },
        ItemName: { type: String, required: true },
        ItemImage: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    delivery_instructions: { type: String },
    order_status: {
        type: String,
        enum: ['placed', 'preparing', 'on the way', 'delivered'],
        default: 'placed',
    },
    payment_status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
    },
    total_price: {
        type: Number,
        required: true
    },
    delivery_fee: {
        type: Number,
        required: true,
        default: 0
    },
    total_amount: {
        type: Number,
        required: true
    },
    tx_ref: {
        type: String,
        default: null
    },
}, { timestamps: true });

const Order = model('Order', orderSchema);

module.exports = Order;

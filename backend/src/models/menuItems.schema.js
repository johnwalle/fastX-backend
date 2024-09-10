const { Schema, model } = require('mongoose');


const menuItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    }, image: {
        type: String,
        required: true
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    }
}, { timestamps: true });

const MenuItem = model('MenuItem', menuItemSchema);

module.exports = MenuItem;
const { Schema, model } = require('mongoose');
const validator = require('validator');
const ApiError = require('../utils/apiError');
const httpStatus = require('http-status');

const restaurantSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return validator.isEmail(value);
            },
            message: 'Please enter a valid email'
        }
    },
    cuisine_types: {
        type: [{
            type: String,
        }],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    address: {
        street: {
            type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        country: {
            type: String,
            default: "Ethiopia"
        }
    },
    location: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    working_days: {
        type: [{
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        }],
        required: true
    },
    phone_number: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    operating_hours: {
        open: {
            type: String,
            required: true
        },
        close: {
            type: String,
            required: true
        }
    }
}, { timestamps: true });


const Restaurant = model('Restaurant', restaurantSchema);

module.exports = Restaurant;
const { Schema, model } = require('mongoose')

const reviewSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userFullName: {
        type: String,
        required: true
    },
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = model('Review', reviewSchema)
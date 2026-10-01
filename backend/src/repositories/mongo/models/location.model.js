import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        unique: true
    },

    street: {
        type: String,
        required: true
    },

    number: {
        type: Number,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    state: {
        type: String,
        required: true
    },

    deletedAt: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});

export const LocationModel = mongoose.model('Location',locationSchema);

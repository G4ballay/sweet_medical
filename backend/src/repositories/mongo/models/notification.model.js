import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipient: { type: String, required: true },
    sender: { type: String, default: "SYSTEM" },
    message: { type: String, required: true },
    createTimestamp: { type: Date, default: Date.now },
    readTimestamp: { type: Date, default: null },
    isRead: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null }
}, {
    timestamps: true
});

export const NotificationModel = mongoose.model('Notification', notificationSchema);

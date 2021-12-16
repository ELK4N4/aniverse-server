import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    message: {
        type: String,
        default: ''
    },
    link: {
        type: String,
        default: null
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    checked: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
}, 
{
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

export default mongoose.model('Notification', notificationSchema, 'Notifications');
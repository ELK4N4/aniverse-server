import mongoose from 'mongoose';

const userVerificationSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
}, 
{
    timestamps: true,
});

export default mongoose.model('UserVerification', userVerificationSchema, 'UsersVerification');
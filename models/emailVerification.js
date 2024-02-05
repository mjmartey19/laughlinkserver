import mongoose, { Schema } from 'mongoose';

const emaillVerification = Schema(
    { 
        userId: String,
        token: String,
        createdAt: Date,
        expiresAt: Date,
}
);

const Verification = mongoose.model('Verification', emaillVerification); 

export default Verification;
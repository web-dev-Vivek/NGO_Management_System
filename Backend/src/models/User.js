import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        clerkUserId: {
            type: String,
            required: [true, 'Clerk User ID is required'],
            unique: true,
            index: true
        },
        firstName: {
            type: String,
            trim: true,
            maxlength: 50,
            default: ''
        },
        lastName: {
            type: String,
            trim: true,
            maxlength: 50,
            default: ''
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        phone: {
            type: String,
            trim: true,
            default: ''
        },
        profileImage: {
            type: String,
            default: ''
        },
        bio: {
            type: String,
            trim: true,
            maxlength: 300,
            default: ''
        },
        skills: [{
            type: String,
            trim: true
        }],
        availability: [{
            type: String,
            trim: true
        }],
        role: {
            type: String,
            enum: ['volunteer', 'coordinator', 'admin'],
            default: 'volunteer'
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'blocked', 'rejected'],
            default: 'pending'
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending'
        }
    },
    {
        timestamps: true
    }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });

export default mongoose.model('User', UserSchema);

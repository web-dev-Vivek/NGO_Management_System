import mongoose from 'mongoose';

const CampaignSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Campaign title is required'],
            trim: true,
            minlength: 3,
            maxlength: 100
        },
        description: {
            type: String,
            required: [true, 'Campaign description is required'],
            trim: true,
            maxlength: 2000
        },
        category: {
            type: String,
            enum: ['Education', 'Health', 'Environment', 'Disaster Relief', 'Community Service', 'Other'],
            default: 'Other'
        },
        bannerImage: {
            type: String,
            default: ''
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required']
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required']
        },
        location: {
            address: {
                type: String,
                required: [true, 'Location address is required'],
                trim: true
            },
            coordinates: {
                latitude: { type: Number, default: null },
                longitude: { type: Number, default: null }
            }
        },
        targetVolunteers: {
            type: Number,
            required: [true, 'Volunteer capacity target is required'],
            min: 1
        },
        volunteersRegistered: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        status: {
            type: String,
            enum: ['draft', 'pending', 'active', 'completed', 'cancelled', 'rejected'],
            default: 'draft'
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        createdByRole: {
            type: String,
            enum: ['coordinator', 'admin'],
            required: true
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        approvedAt: {
            type: Date
        },
        impact: {
            target: { type: Number, default: 0 },
            achieved: { type: Number, default: 0 },
            unit: { type: String, default: '' }
        }
    },
    {
        timestamps: true
    }
);

// Indexes
CampaignSchema.index({ category: 1 });
CampaignSchema.index({ status: 1 });
CampaignSchema.index({ startDate: 1 });

export default mongoose.model('Campaign', CampaignSchema);

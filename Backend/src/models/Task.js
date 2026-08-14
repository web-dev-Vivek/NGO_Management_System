import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true,
            maxlength: 100
        },
        description: {
            type: String,
            required: [true, 'Task description is required'],
            trim: true,
            maxlength: 1000
        },
        campaignId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Campaign',
            required: [true, 'Campaign reference is required']
        },
        assignedVolunteer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Assigned volunteer is required']
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'completed', 'verified', 'cancelled'],
            default: 'pending'
        },
        dueDate: {
            type: Date,
            required: [true, 'Due date is required']
        },
        loggedHours: {
            type: Number,
            default: 0,
            min: 0
        },
        checkInTime: {
            type: Date
        },
        checkOutTime: {
            type: Date
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

// Indexes
TaskSchema.index({ campaignId: 1 });
TaskSchema.index({ assignedVolunteer: 1 });
TaskSchema.index({ status: 1 });

export default mongoose.model('Task', TaskSchema);

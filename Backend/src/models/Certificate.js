import mongoose from 'mongoose';

const CertificateSchema = new mongoose.Schema(
    {
        certificateId: {
            type: String,
            required: [true, 'Certificate ID (cryptographic hash) is required'],
            unique: true,
            index: true
        },
        volunteerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Volunteer reference is required']
        },
        campaignId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Campaign',
            required: [true, 'Campaign reference is required']
        },
        hoursLogged: {
            type: Number,
            required: [true, 'Hours logged count is required'],
            min: 0
        },
        issueDate: {
            type: Date,
            default: Date.now
        },
        signedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Signing Admin reference is required']
        },
        pdfUrl: {
            type: String,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model('Certificate', CertificateSchema);

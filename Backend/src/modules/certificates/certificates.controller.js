import Certificate from '../../models/Certificate.js';
import User from '../../models/User.js';
import Campaign from '../../models/Campaign.js';
import Task from '../../models/Task.js';
import { generateCertificatePDF } from './pdfGenerator.js';
import { v4 as uuidv4 } from 'uuid';

// @desc    Issue Certificate to Volunteer
// @route   POST /api/certificates/issue
// @access  Private (Admin only)
export const issueCertificate = async (req, res, next) => {
    try {
        const { volunteerId, campaignId } = req.body;

        if (!volunteerId || !campaignId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both volunteerId and campaignId'
            });
        }

        // Check if volunteer exists
        const volunteer = await User.findById(volunteerId);
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        // Check if campaign exists
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Check if certificate already exists
        const existingCert = await Certificate.findOne({ volunteerId, campaignId });
        if (existingCert) {
            return res.status(400).json({
                success: false,
                message: 'A certificate has already been issued to this volunteer for this campaign'
            });
        }

        // Calculate hours verified for this user in this campaign
        const verifiedTasks = await Task.find({
            campaignId,
            assignedVolunteer: volunteerId,
            status: 'verified'
        });

        const totalHours = verifiedTasks.reduce((sum, task) => sum + (task.loggedHours || 0), 0);

        const certificateId = uuidv4();
        const issueDate = new Date();

        // Generate PDF
        let pdfUrl = '';
        try {
            pdfUrl = await generateCertificatePDF({
                certificateId,
                volunteerName: `${volunteer.firstName} ${volunteer.lastName}`,
                campaignTitle: campaign.title,
                hoursLogged: totalHours,
                issueDate,
                signerName: `${req.user.firstName} ${req.user.lastName}`
            });
        } catch (pdfError) {
            console.error('PDF generation error:', pdfError);
            return res.status(500).json({
                success: false,
                message: 'Failed to generate certificate PDF document'
            });
        }

        const certificate = await Certificate.create({
            certificateId,
            volunteerId,
            campaignId,
            hoursLogged: totalHours,
            issueDate,
            signedBy: req.user._id,
            pdfUrl
        });

        res.status(201).json({
            success: true,
            message: 'Cryptographic Certificate issued successfully!',
            data: certificate
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Current Volunteer's Certificates
// @route   GET /api/certificates/my
// @access  Private (Volunteer only)
export const getMyCertificates = async (req, res, next) => {
    try {
        const certificates = await Certificate.find({ volunteerId: req.user._id })
            .populate('campaignId', 'title description category')
            .populate('signedBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: certificates.length,
            data: certificates
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify Cryptographic Certificate ID
// @route   GET /api/certificates/:id
// @access  Public
export const verifyCertificateHash = async (req, res, next) => {
    try {
        const certificate = await Certificate.findOne({ certificateId: req.params.id })
            .populate('volunteerId', 'firstName lastName email profileImage')
            .populate('campaignId', 'title description category startDate endDate')
            .populate('signedBy', 'firstName lastName');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Invalid certificate token. The verification key could not be found.'
            });
        }

        res.status(200).json({
            success: true,
            verified: true,
            data: certificate
        });
    } catch (error) {
        next(error);
    }
};

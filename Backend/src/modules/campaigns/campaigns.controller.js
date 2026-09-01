import Campaign from '../../models/Campaign.js';
import User from '../../models/User.js';

// @desc    Create Campaign
// @route   POST /api/campaigns
// @access  Private (Coordinator/Admin only)
export const createCampaign = async (req, res, next) => {
    try {
        const { 
            title, 
            description, 
            category, 
            bannerImage, 
            startDate, 
            endDate, 
            location, 
            targetVolunteers,
            impact,
            status
        } = req.body;

        // Validation
        if (!title || !description || !startDate || !endDate || !location?.address || !targetVolunteers) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: title, description, startDate, endDate, location.address, targetVolunteers'
            });
        }

        // Default status: Admin creates active campaigns; Coordinator creates pending/draft
        let initialStatus = 'pending';
        if (req.user.role === 'admin') {
            initialStatus = status === 'draft' ? 'draft' : 'active';
        } else {
            initialStatus = status === 'draft' ? 'draft' : 'pending';
        }

        let createdBy = req.user._id;
        let createdByRole = req.user.role;

        if (req.user.role === 'admin' && req.body.createdBy) {
            createdBy = req.body.createdBy;
            const assignedUser = await User.findById(req.body.createdBy);
            if (assignedUser) {
                createdByRole = assignedUser.role;
            }
        }

        const campaign = await Campaign.create({
            title,
            description,
            category,
            bannerImage,
            startDate,
            endDate,
            location,
            targetVolunteers,
            status: initialStatus,
            createdBy,
            createdByRole,
            impact: impact || { target: 0, achieved: 0, unit: '' }
        });

        res.status(201).json({
            success: true,
            data: campaign
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get All Campaigns (Search & Filters)
// @route   GET /api/campaigns
// @access  Public
export const getCampaigns = async (req, res, next) => {
    try {
        const { search, category, status } = req.query;
        let query = { isDeleted: { $ne: true } };

        // Apply filters
        if (category) {
            query.category = category;
        }

        if (status) {
            query.status = status;
        }

        // Apply keyword text search
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { 'location.address': { $regex: search, $options: 'i' } }
            ];
        }

        // Populate and run query
        const campaigns = await Campaign.find(query)
            .populate('createdBy', 'firstName lastName email')
            .populate('volunteersRequested', 'firstName lastName email profileImage')
            .populate('volunteersRegistered', 'firstName lastName email profileImage')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: campaigns.length,
            data: campaigns
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get Campaign Details
// @route   GET /api/campaigns/:id
// @access  Public
export const getCampaignById = async (req, res, next) => {
    try {
        const campaign = await Campaign.findById(req.params.id)
            .populate('createdBy', 'firstName lastName email')
            .populate('volunteersRegistered', 'firstName lastName email profileImage')
            .populate('volunteersRequested', 'firstName lastName email profileImage');

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        res.status(200).json({
            success: true,
            data: campaign
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update Campaign Details
// @route   PUT /api/campaigns/:id
// @access  Private (Coordinator/Admin only)
export const updateCampaign = async (req, res, next) => {
    try {
        let campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Authorization check: Coordinators can only edit their own campaigns
        if (req.user.role === 'coordinator' && campaign.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to edit this campaign'
            });
        }

        const fieldsToUpdate = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            bannerImage: req.body.bannerImage,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            location: req.body.location,
            targetVolunteers: req.body.targetVolunteers,
            impact: req.body.impact
        };

        // Admins can approve campaigns and assign coordinators
        if (req.user.role === 'admin') {
            if (req.body.status) {
                fieldsToUpdate.status = req.body.status;
                if (req.body.status === 'active') {
                    fieldsToUpdate.approvedBy = req.user._id;
                    fieldsToUpdate.approvedAt = new Date();
                }
            }
            if (req.body.createdBy) {
                fieldsToUpdate.createdBy = req.body.createdBy;
                const assignedUser = await User.findById(req.body.createdBy);
                if (assignedUser) {
                    fieldsToUpdate.createdByRole = assignedUser.role;
                }
            }
        } else if (req.body.status) {
            // Coordinator can change status to pending (publish it) or draft
            if (['draft', 'pending'].includes(req.body.status)) {
                fieldsToUpdate.status = req.body.status;
            }
        }

        // Clean undefined keys
        Object.keys(fieldsToUpdate).forEach(
            key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
        );

        campaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            { $set: fieldsToUpdate },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: campaign
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Register Volunteer for Campaign
// @route   POST /api/campaigns/:id/register
// @access  Private (Volunteer only)
export const registerForCampaign = async (req, res, next) => {
    try {
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Campaign must be active
        if (campaign.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Campaign is not open for registration'
            });
        }

        // Volunteer cannot double register
        if (campaign.volunteersRegistered.includes(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this campaign'
            });
        }

        // Check if volunteer already requested
        if (campaign.volunteersRequested.includes(req.user._id)) {
            return res.status(400).json({
                success: false,
                message: 'You have already requested to join this campaign'
            });
        }

        // Check cap capacity limits
        if (campaign.volunteersRegistered.length >= campaign.targetVolunteers) {
            return res.status(400).json({
                success: false,
                message: 'This campaign volunteer capacity has been reached'
            });
        }

        // Add user ObjectId to campaign requests list
        campaign.volunteersRequested.push(req.user._id);
        await campaign.save();

        await campaign.populate([
            { path: 'volunteersRegistered', select: 'firstName lastName email profileImage' },
            { path: 'volunteersRequested', select: 'firstName lastName email profileImage' },
            { path: 'createdBy', select: 'firstName lastName email profileImage role' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Your registration request has been submitted successfully. Awaiting approval.',
            data: campaign
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve/Reject Volunteer Enrollment Request
// @route   POST /api/campaigns/:id/approve-volunteer
// @access  Private (Coordinator/Admin only)
export const approveVolunteerRegistration = async (req, res, next) => {
    try {
        const { volunteerId, action } = req.body; // action: 'approve' or 'reject'
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Authorization checks:
        // 1. If campaign has a coordinator, only that coordinator can approve
        // 2. If campaign has NO coordinator (createdByRole === 'admin'), only Admin can approve
        let isCoordinated = campaign.createdByRole === 'coordinator';
        if (!isCoordinated && campaign.createdBy) {
            const creator = await User.findById(campaign.createdBy);
            if (creator && creator.role === 'coordinator') {
                isCoordinated = true;
            }
        }

        if (isCoordinated) {
            if (req.user.role === 'coordinator' && campaign.createdBy && campaign.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized: You are not the coordinator of this campaign'
                });
            }
            if (req.user.role === 'volunteer') {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized: Volunteers cannot approve enrollments'
                });
            }
        } else {
            // Admin created it: only Admin can approve
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized: Only Admins can approve registrations for uncoordinated campaigns'
                });
            }
        }

        // Check if volunteer is in requests list
        const isRequested = campaign.volunteersRequested.some(
            id => id.toString() === (volunteerId ? volunteerId.toString() : '')
        );

        if (!isRequested) {
            return res.status(400).json({
                success: false,
                message: 'Volunteer request not found in this campaign'
            });
        }

        // Remove from requests list
        campaign.volunteersRequested = campaign.volunteersRequested.filter(
            id => id.toString() !== (volunteerId ? volunteerId.toString() : '')
        );

        if (action === 'approve') {
            // Add to registered list
            if (!campaign.volunteersRegistered.some(id => id.toString() === (volunteerId ? volunteerId.toString() : ''))) {
                campaign.volunteersRegistered.push(volunteerId);
            }
        }

        await campaign.save();

        await campaign.populate([
            { path: 'volunteersRegistered', select: 'firstName lastName email profileImage' },
            { path: 'volunteersRequested', select: 'firstName lastName email profileImage' },
            { path: 'createdBy', select: 'firstName lastName email profileImage role' }
        ]);

        res.status(200).json({
            success: true,
            message: `Volunteer registration ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
            data: campaign
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Upload Banner Controller
// @route   POST /api/campaigns/banner
// @access  Private (Coordinator/Admin only)
export const uploadBannerController = (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a banner image file'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Campaign banner uploaded successfully',
            file: {
                filename: req.file.filename,
                path: `/uploads/campaigns/${req.file.filename}`,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    } catch (error) {
        next(error);
    }
};

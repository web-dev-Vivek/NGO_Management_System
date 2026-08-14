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
            createdBy: req.user._id,
            createdByRole: req.user.role,
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
            .populate('volunteersRegistered', 'firstName lastName email profileImage');

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

        // Admins can approve campaigns
        if (req.user.role === 'admin' && req.body.status) {
            fieldsToUpdate.status = req.body.status;
            if (req.body.status === 'active') {
                fieldsToUpdate.approvedBy = req.user._id;
                fieldsToUpdate.approvedAt = new Date();
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

        // Check cap capacity limits
        if (campaign.volunteersRegistered.length >= campaign.targetVolunteers) {
            return res.status(400).json({
                success: false,
                message: 'This campaign volunteer capacity has been reached'
            });
        }

        // Add user ObjectId to campaign registration list
        campaign.volunteersRegistered.push(req.user._id);
        await campaign.save();

        res.status(200).json({
            success: true,
            message: 'Successfully registered for this campaign',
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

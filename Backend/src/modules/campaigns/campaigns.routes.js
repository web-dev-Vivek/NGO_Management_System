import express from 'express';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { uploadCampaignBanner } from '../../middleware/upload.js';
import {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    registerForCampaign,
    approveVolunteerRegistration,
    uploadBannerController
} from './campaigns.controller.js';

const router = express.Router();

// GET /api/campaigns -> View active campaigns (Public / Authenticated users)
router.get('/', getCampaigns);

// GET /api/campaigns/:id -> View specific campaign details
router.get('/:id', getCampaignById);

// POST /api/campaigns -> Create campaign (Coordinators and Admins only)
router.post('/', protect, authorize('coordinator', 'admin'), createCampaign);

// PUT /api/campaigns/:id -> Update campaign details (Coordinators and Admins only)
router.put('/:id', protect, authorize('coordinator', 'admin'), updateCampaign);

// POST /api/campaigns/:id/register -> Register to join a campaign (Volunteers only)
router.post('/:id/register', protect, authorize('volunteer'), registerForCampaign);

// POST /api/campaigns/:id/approve-volunteer -> Approve/Reject enrollment (Coordinators and Admins only)
router.post('/:id/approve-volunteer', protect, authorize('coordinator', 'admin'), approveVolunteerRegistration);

// POST /api/campaigns/banner -> Upload banner image file (Coordinators and Admins only)
router.post('/banner', protect, authorize('coordinator', 'admin'), uploadCampaignBanner, uploadBannerController);

export default router;

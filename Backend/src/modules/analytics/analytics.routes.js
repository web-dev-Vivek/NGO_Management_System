import express from 'express';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import { getDashboardAnalytics } from './analytics.controller.js';

const router = express.Router();

// GET /api/analytics/dashboard -> Retrieve global KPI metrics (Coordinator/Admin only)
router.get('/dashboard', protect, authorize('coordinator', 'admin'), getDashboardAnalytics);

export default router;

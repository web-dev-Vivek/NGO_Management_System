import express from 'express';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import {
    getCurrentUser,
    updateUserProfile,
    getAllUsers,
    updateUserRole,
    updateUserStatus
} from './users.controller.js';

const router = express.Router();

// GET /api/users/me -> Get logged-in user profile details
router.get('/me', protect, getCurrentUser);

// PUT /api/users/profile -> Update personal profile details (bio, skills, phone, availability)
router.put('/profile', protect, updateUserProfile);

// GET /api/users -> Retrieve all users (Admin & Coordinator access only)
router.get('/', protect, authorize('admin', 'coordinator'), getAllUsers);

// PUT /api/users/:clerkUserId/role -> Configure user role (Admin only)
router.put('/:clerkUserId/role', protect, authorize('admin'), updateUserRole);

// PUT /api/users/:clerkUserId/status -> Approve, reject, or block user account (Admin only)
router.put('/:clerkUserId/status', protect, authorize('admin'), updateUserStatus);

export default router;

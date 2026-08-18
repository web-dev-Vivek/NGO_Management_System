import express from 'express';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import {
    getCurrentUser,
    updateUserProfile,
    getAllUsers,
    updateUserRole,
    updateUserStatus,
    createCoordinatorRequest,
    getCoordinatorRequests,
    resolveCoordinatorRequest
} from './users.controller.js';

const router = express.Router();

// GET /api/users/me -> Get logged-in user profile details
router.get('/me', protect, getCurrentUser);

// PUT /api/users/profile -> Update personal profile details (bio, skills, phone, availability)
router.put('/profile', protect, updateUserProfile);

// POST /api/users/coordinator-requests -> Volunteer requests campaign coordinator role
router.post('/coordinator-requests', protect, createCoordinatorRequest);

// GET /api/users/coordinator-requests -> Get coordinator requests (Admin: pending, Volunteer: personal requests)
router.get('/coordinator-requests', protect, getCoordinatorRequests);

// POST /api/users/coordinator-requests/:id/resolve -> Admin resolves coordinator request
router.post('/coordinator-requests/:id/resolve', protect, authorize('admin'), resolveCoordinatorRequest);

// GET /api/users -> Retrieve all users (Admin & Coordinator access only)
router.get('/', protect, authorize('admin', 'coordinator'), getAllUsers);

// PUT /api/users/:clerkUserId/role -> Configure user role (Admin only)
router.put('/:clerkUserId/role', protect, authorize('admin'), updateUserRole);

// PUT /api/users/:clerkUserId/status -> Approve, reject, or block user account (Admin & Coordinator only)
router.put('/:clerkUserId/status', protect, authorize('admin', 'coordinator'), updateUserStatus);

export default router;

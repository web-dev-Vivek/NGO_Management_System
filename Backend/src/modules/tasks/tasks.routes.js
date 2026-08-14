import express from 'express';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import {
    createTask,
    getTasks,
    updateTaskStatus,
    logTaskHours,
    verifyTaskHours
} from './tasks.controller.js';

const router = express.Router();

// Apply protection to all task endpoints
router.use(protect);

// GET /api/tasks -> Retrieve tasks (Volunteer: personal list, Admin/Coordinator: full roster)
// POST /api/tasks -> Assign tasks to volunteers (Coordinator and Admin access only)
router.route('/')
    .get(getTasks)
    .post(authorize('coordinator', 'admin'), createTask);

// PUT /api/tasks/:id/status -> Update state (Volunteer set to active/complete, Coordinator verify)
router.put('/:id/status', updateTaskStatus);

// POST /api/tasks/:id/log-hours -> Perform check-in / check-out logs (Volunteer only)
router.post('/:id/log-hours', authorize('volunteer'), logTaskHours);

// PUT /api/tasks/:id/verify -> Approve/Reject volunteer hours logged (Coordinator and Admin only)
router.put('/:id/verify', authorize('coordinator', 'admin'), verifyTaskHours);

export default router;

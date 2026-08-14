import Task from '../../models/Task.js';
import Campaign from '../../models/Campaign.js';
import User from '../../models/User.js';

// @desc    Assign Task to Volunteer
// @route   POST /api/tasks
// @access  Private (Coordinator/Admin only)
export const createTask = async (req, res, next) => {
    try {
        const { title, description, campaignId, assignedVolunteer, dueDate, priority } = req.body;

        // Validation
        if (!title || !description || !campaignId || !assignedVolunteer || !dueDate) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: title, description, campaignId, assignedVolunteer, dueDate'
            });
        }

        // Verify campaign exists
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Referenced campaign not found'
            });
        }

        // Verify volunteer exists
        const volunteer = await User.findById(assignedVolunteer);
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Assigned volunteer not found'
            });
        }

        const task = await Task.create({
            title,
            description,
            campaignId,
            assignedVolunteer,
            dueDate,
            priority: priority || 'medium',
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get All Tasks (Filtered by role permissions)
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
    try {
        const { campaignId, status, assignedVolunteer } = req.query;
        let query = {};

        // Restrict query for volunteers to only their own tasks
        if (req.user.role === 'volunteer') {
            query.assignedVolunteer = req.user._id;
        } else if (assignedVolunteer) {
            // Coordinator/Admin can filter by volunteer
            query.assignedVolunteer = assignedVolunteer;
        }

        if (campaignId) {
            query.campaignId = campaignId;
        }

        if (status) {
            query.status = status;
        }

        const tasks = await Task.find(query)
            .populate('assignedVolunteer', 'firstName lastName email profileImage')
            .populate('campaignId', 'title')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update Task Status
// @route   PUT /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const allowedStatuses = ['pending', 'in-progress', 'completed', 'verified', 'cancelled'];

        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Please provide a valid status: ${allowedStatuses.join(', ')}`
            });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Authorization checks
        const isAssigned = task.assignedVolunteer.toString() === req.user._id.toString();
        const isPrivileged = ['coordinator', 'admin'].includes(req.user.role);

        if (!isAssigned && !isPrivileged) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this task status'
            });
        }

        // Volunteers can only set to in-progress or completed
        if (!isPrivileged && ['verified', 'cancelled'].includes(status)) {
            return res.status(403).json({
                success: false,
                message: 'Volunteers cannot verify or cancel tasks'
            });
        }

        task.status = status;
        
        // If coordinator approves to verified, record validator
        if (status === 'verified') {
            task.verifiedBy = req.user._id;
        }

        await task.save();

        res.status(200).json({
            success: true,
            message: `Task status updated successfully to ${status}`,
            data: task
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Check-in / Check-out Hour Logger
// @route   POST /api/tasks/:id/log-hours
// @access  Private (Volunteer only)
export const logTaskHours = async (req, res, next) => {
    try {
        const { action } = req.body; // 'check-in' or 'check-out'
        if (!action || !['check-in', 'check-out'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide action: check-in or check-out'
            });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Ensure assigned volunteer is the caller
        if (task.assignedVolunteer.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to log hours for this task'
            });
        }

        if (action === 'check-in') {
            task.checkInTime = new Date();
            task.checkOutTime = null; // reset if logging again
            task.status = 'in-progress';
            await task.save();

            return res.status(200).json({
                success: true,
                message: 'Successfully checked in to task!',
                data: task
            });
        }

        if (action === 'check-out') {
            if (!task.checkInTime) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot check-out without checking-in first'
                });
            }

            task.checkOutTime = new Date();
            
            // Calculate elapsed hours
            const diffMs = task.checkOutTime - task.checkInTime;
            const hours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimals

            task.loggedHours = hours > 0 ? hours : 0.1; // Default to 0.1 hour if checked out instantly
            task.status = 'completed'; // Ready for validation
            await task.save();

            return res.status(200).json({
                success: true,
                message: `Successfully checked out! Logged ${task.loggedHours} hours. Waiting for coordinator verification.`,
                data: task
            });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Verify Volunteer Hours
// @route   PUT /api/tasks/:id/verify
// @access  Private (Coordinator/Admin only)
export const verifyTaskHours = async (req, res, next) => {
    try {
        const { status, approvedHours } = req.body; // status: 'verified' or 'rejected'

        if (!status || !['verified', 'cancelled', 'pending'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide verification status: verified, cancelled, pending'
            });
        }

        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        task.status = status;
        task.verifiedBy = req.user._id;

        if (status === 'verified' && typeof approvedHours === 'number') {
            task.loggedHours = approvedHours;
        } else if (status === 'pending' || status === 'cancelled') {
            task.loggedHours = 0; // reset hours if rejected/cancelled
            task.checkInTime = null;
            task.checkOutTime = null;
        }

        await task.save();

        res.status(200).json({
            success: true,
            message: `Task hours verification completed as ${status}`,
            data: task
        });
    } catch (error) {
        next(error);
    }
};

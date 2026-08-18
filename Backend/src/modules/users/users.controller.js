import User from '../../models/User.js';

// @desc    Get Current Logged In User Profile
// @route   GET /api/users/me
// @access  Private
export const getCurrentUser = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            data: req.user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update User Profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            bio: req.body.bio,
            skills: req.body.skills,
            availability: req.body.availability
        };

        // Remove undefined fields
        Object.keys(fieldsToUpdate).forEach(
            key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
        );

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: fieldsToUpdate },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get All Users (Directory view)
// @route   GET /api/users
// @access  Private (Admin/Coordinator only)
export const getAllUsers = async (req, res, next) => {
    try {
        const { search, role, status } = req.query;
        let query = {};

        // Apply filters if provided
        if (role) {
            query.role = role;
        }

        if (status) {
            query.status = status;
        }

        // Apply search keyword filter across name & email
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Change User Role
// @route   PUT /api/users/:clerkUserId/role
// @access  Private (Admin only)
export const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;

        if (!role || !['volunteer', 'coordinator', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid role: volunteer, coordinator, admin'
            });
        }

        let updateData = { role };
        if (role === 'coordinator') {
            updateData.coordinatorRequested = false;
            updateData.status = 'active';
            updateData.verificationStatus = 'verified';
        }

        const user = await User.findOneAndUpdate(
            { clerkUserId: req.params.clerkUserId },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `User role updated successfully to ${role}`,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve/Reject or Block User status
// @route   PUT /api/users/:clerkUserId/status
// @access  Private (Admin only)
export const updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!status || !['pending', 'active', 'blocked', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid status: pending, active, blocked, rejected'
            });
        }

        const userToUpdate = await User.findOne({ clerkUserId: req.params.clerkUserId });

        if (!userToUpdate) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Coordinators can only approve volunteer accounts
        if (req.user.role === 'coordinator' && userToUpdate.role !== 'volunteer') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized: Coordinators can only update volunteer account statuses'
            });
        }

        let updateFields = { status };
        
        // If approved/active, auto-verify user
        if (status === 'active') {
            updateFields.verificationStatus = 'verified';
        } else if (status === 'rejected') {
            updateFields.verificationStatus = 'rejected';
        }

        const user = await User.findOneAndUpdate(
            { clerkUserId: req.params.clerkUserId },
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: `User account status updated successfully to ${status}`,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Request to become Coordinator
// @route   PUT /api/users/request-coordinator
// @access  Private (Volunteer only)
export const requestCoordinator = async (req, res, next) => {
    try {
        if (req.user.role !== 'volunteer') {
            return res.status(400).json({
                success: false,
                message: 'Only volunteers can request to become a coordinator'
            });
        }

        req.user.coordinatorRequested = true;
        await req.user.save();

        res.status(200).json({
            success: true,
            message: 'Request to become a coordinator submitted successfully. Awaiting Admin approval.',
            data: req.user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all pending Coordinator promotion requests
// @route   GET /api/users/coordinator-requests
// @access  Private (Admin only)
export const getCoordinatorRequests = async (req, res, next) => {
    try {
        const users = await User.find({ coordinatorRequested: true }).sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};


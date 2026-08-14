import User from '../../models/User.js';
import Campaign from '../../models/Campaign.js';
import Task from '../../models/Task.js';
import Certificate from '../../models/Certificate.js';

// @desc    Get Global Dashboard KPI Analytics
// @route   GET /api/analytics/dashboard
// @access  Private (Coordinator/Admin only)
export const getDashboardAnalytics = async (req, res, next) => {
    try {
        // Run count queries in parallel
        const [
            totalVolunteers,
            totalCoordinators,
            activeCampaigns,
            pendingCampaigns,
            completedCampaigns,
            totalTasks,
            verifiedTasks,
            certificatesIssued
        ] = await Promise.all([
            User.countDocuments({ role: 'volunteer', status: 'active' }),
            User.countDocuments({ role: 'coordinator', status: 'active' }),
            Campaign.countDocuments({ status: 'active', isDeleted: { $ne: true } }),
            Campaign.countDocuments({ status: 'pending', isDeleted: { $ne: true } }),
            Campaign.countDocuments({ status: 'completed', isDeleted: { $ne: true } }),
            Task.countDocuments(),
            Task.countDocuments({ status: 'verified' }),
            Certificate.countDocuments()
        ]);

        // Aggregate total verified volunteering hours logged
        const hoursResult = await Task.aggregate([
            { $match: { status: 'verified' } },
            { $group: { _id: null, totalHours: { $sum: '$loggedHours' } } }
        ]);

        const totalHours = hoursResult.length > 0 ? hoursResult[0].totalHours : 0;

        res.status(200).json({
            success: true,
            data: {
                totalVolunteers,
                totalCoordinators,
                activeCampaigns,
                pendingCampaigns,
                completedCampaigns,
                totalTasks,
                verifiedTasks,
                totalHours,
                certificatesIssued
            }
        });
    } catch (error) {
        next(error);
    }
};

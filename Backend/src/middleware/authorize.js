export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        // Check if user is blocked
        if (req.user.status === 'blocked') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been blocked. Please contact an administrator.'
            });
        }

        // Validate role matches
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role '${req.user.role}' is not authorized to access this resource`
            });
        }

        next();
    };
};

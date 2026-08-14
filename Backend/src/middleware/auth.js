import { clerkClient } from '@clerk/express';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    try {
        // Clerk middleware (clerkMiddleware) attaches the auth object to req.auth
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route, no credentials provided'
            });
        }

        const clerkUserId = req.auth.userId;

        // Find the user in our database
        let user = await User.findOne({ clerkUserId });

        // Auto-sync user if they do not exist in local database
        if (!user) {
            try {
                // Fetch full user details from Clerk
                const clerkUser = await clerkClient.users.getUser(clerkUserId);
                
                const email = clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0
                    ? clerkUser.emailAddresses[0].emailAddress
                    : '';

                // Create the user record in Mongoose
                user = await User.create({
                    clerkUserId,
                    firstName: clerkUser.firstName || '',
                    lastName: clerkUser.lastName || '',
                    email,
                    profileImage: clerkUser.imageUrl || '',
                    role: 'volunteer', // Default role
                    status: 'pending',  // Must be approved by Admin
                    verificationStatus: 'pending'
                });
                
                console.log(`Auto-created local user database profile for Clerk ID: ${clerkUserId}`);
            } catch (clerkError) {
                console.error(`Clerk fetch failed: ${clerkError.message}`);
                return res.status(500).json({
                    success: false,
                    message: 'Error synchronizing user session with authentication provider'
                });
            }
        }

        // Attach user model instance to the request
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

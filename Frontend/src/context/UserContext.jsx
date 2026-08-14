import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const { user: clerkUser } = useUser();
    const [dbUser, setDbUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDbUser = async () => {
        if (!isSignedIn) {
            setDbUser(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const token = await getToken();
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (response.ok && result.success) {
                setDbUser(result.data);
                setError(null);
            } else {
                setError(result.message || 'Failed to fetch user profile');
            }
        } catch (err) {
            setError(err.message || 'An error occurred fetching your profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded) {
            fetchDbUser();
        }
    }, [isLoaded, isSignedIn, clerkUser]);

    const updateProfile = async (profileData) => {
        try {
            const token = await getToken();
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            const result = await response.json();
            if (response.ok && result.success) {
                setDbUser(result.data);
                return { success: true };
            } else {
                return { success: false, error: result.message };
            }
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    return (
        <UserContext.Provider value={{ dbUser, loading, error, refreshUser: fetchDbUser, updateProfile }}>
            {children}
        </UserContext.Provider>
    );
};

export const useDbUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useDbUser must be used within a UserProvider');
    }
    return context;
};

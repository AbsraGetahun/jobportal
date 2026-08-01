import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Create the AuthContext
const AuthContext = createContext(null);

// Custom hook to use the AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Axios instance for API calls with token handling
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Ensure the API URL has the /api suffix
const finalApiUrl = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;

const authApi = axios.create({
    baseURL: finalApiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add access token
authApi.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('access_token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor to handle token refresh on 401 errors
authApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Handle 401 errors by logging out the user
        if (error.response && error.response.status === 401) {
            localStorage.clear(); // Clear all tokens
            window.location.href = '/login'; // Redirect to login
        }
        return Promise.reject(error);
    }
);


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Function to load user from localStorage
    const loadUserFromStorage = useCallback(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const accessToken = localStorage.getItem('access_token');
            if (storedUser && accessToken) {
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Failed to load user from localStorage:", error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load and listen to storage changes
    useEffect(() => {
        loadUserFromStorage();

        const handleStorageChange = () => {
            loadUserFromStorage();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadUserFromStorage]);

    const login = useCallback((userData, accessToken) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('access_token', accessToken);
        setUser(userData);
        setIsAuthenticated(true);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        // Navigate explicitly to login might be needed in App.jsx or main router logic
    }, []);

    // Provide the combined user type for convenience
    const userType = user?.is_admin ? 'admin' : (user?.hasCompany !== null ? 'employer' : 'jobseeker');

    const authContextValue = {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        userType,
        jobSeekerId: userType === 'jobseeker' ? user?.id : null, // Assuming user.id is the jobseeker_id
        employerId: userType === 'employer' ? user?.id : null,   // Assuming user.id is the employer_id
        adminId: userType === 'admin' ? user?.id : null,   // Assuming user.id is the admin_id
        api: authApi // Export the configured axios instance
    };

    if (loading) {
        return <div>Loading authentication...</div>; // Or a simple spinner
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

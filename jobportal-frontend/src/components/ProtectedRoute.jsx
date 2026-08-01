import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import from the new AuthContext

/**
 * ProtectedRoute component to guard routes requiring authentication.
 *
 * @param {object} props
 * @param {string[]} [props.allowedUserTypes] - Optional array of user types allowed ('jobseeker', 'employer', 'admin').
 * If not provided, any authenticated user can access.
 * @returns {JSX.Element} The child route elements if authenticated and authorized,
 * otherwise redirects to the login page.
 */
const ProtectedRoute = ({ allowedUserTypes }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return <div>Loading session...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
    }

    if (allowedUserTypes && allowedUserTypes.length > 0) {
        const currentUserType = user?.is_admin ? 'admin' : (user?.hasCompany !== null ? 'employer' : 'jobseeker');
        if (!currentUserType || !allowedUserTypes.includes(currentUserType)) {
            console.warn(`Access denied. User type "${currentUserType}" is not allowed for this route.`);
            return <Navigate to="/dashboard" replace state={{ error: "Unauthorized access." }} />; // Redirect to dashboard instead of home
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;

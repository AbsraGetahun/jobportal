import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated) {
                // If not authenticated, redirect to login
                navigate('/login');
            } else {
                // Determine user type and redirect accordingly
                const userType = user?.is_admin ? 'admin' : (user?.hasCompany !== null ? 'employer' : 'jobseeker');
                
                switch (userType) {
                    case 'admin':
                        navigate('/admin/dashboard');
                        break;
                    case 'employer':
                        navigate('/employeraccount');
                        break;
                    case 'jobseeker':
                        navigate('/jobseekeraccount');
                        break;
                    default:
                        // If user type cannot be determined, redirect to login
                        navigate('/login');
                }
            }
        }
    }, [isAuthenticated, user, loading, navigate]);

    // Show loading state while checking authentication
    if (loading) {
        return <div>Loading...</div>;
    }

    // This component doesn't render anything as it always redirects
    return null;
};

export default Dashboard;
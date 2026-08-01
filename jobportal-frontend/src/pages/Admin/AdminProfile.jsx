import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FiUser, FiMail, FiPhone, FiLock, FiLogOut, FiSun, FiMoon, FiBell } from 'react-icons/fi';

function AdminProfile() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return savedTheme;
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const fetchAdminProfile = async () => {
            try {
                const response = await api.get('/admin/profile');
                setAdmin(response.data);
            } catch (err) {
                setError(err.message || 'Failed to fetch admin profile');
            } finally {
                setLoading(false);
            }
        };

        fetchAdminProfile();
    }, []);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!admin) return <div>No admin data found</div>;

    return (
        <div className={`admin-profile ${theme}`}>
            <header className="admin-header">
                <h1>Admin Dashboard</h1>
                <div className="admin-header-actions">
                    <button className="notification-button" onClick={() => navigate('/admin/feedback')}>
                        <FiBell />
                        <span className="notification-badge">3</span>
                    </button>
                    <button className="theme-toggle" onClick={toggleTheme}>
                        {theme === 'light' ? <FiMoon /> : <FiSun />}
                    </button>
                    <button className="logout-button" onClick={handleLogout}>
                        <FiLogOut /> Logout
                    </button>
                </div>
            </header>

            <main className="admin-main">
                <div className="profile-card">
                    <h2>Admin Profile</h2>
                    <div className="profile-info">
                        <div className="info-item">
                            <FiUser className="info-icon" />
                            <span className="info-label">Name:</span>
                            <span className="info-value">{admin.name}</span>
                        </div>
                        <div className="info-item">
                            <FiMail className="info-icon" />
                            <span className="info-label">Email:</span>
                            <span className="info-value">{admin.email}</span>
                        </div>
                        <div className="info-item">
                            <FiPhone className="info-icon" />
                            <span className="info-label">Phone:</span>
                            <span className="info-value">{admin.phone || 'Not provided'}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminProfile;
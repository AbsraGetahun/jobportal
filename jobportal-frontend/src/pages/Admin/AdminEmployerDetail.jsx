import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCheckCircle, FiXCircle, FiLogOut, FiSun, FiMoon, FiHome, FiBell } from 'react-icons/fi';
import '../../styles/pages/Admin/AdminEmployerDetail.css';

function AdminEmployerDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [employer, setEmployer] = useState(null);
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
        const fetchEmployer = async () => {
            try {
                // Since there's no specific employer detail endpoint, we'll get all employers and find the one we need
                const response = await api.getAdminEmployers();
                const employersData = Array.isArray(response.data?.data) ? response.data.data : [];
                const foundEmployer = employersData.find(emp => emp.id == id);

                if (foundEmployer) {
                    setEmployer(foundEmployer);
                } else {
                    setError('Employer not found');
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch employer details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEmployer();
        }
    }, [id]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleVerifyEmployer = async (employerId, isVerified) => {
        try {
            await api.put(`/admin/employers/${employerId}/verify`, { is_verified: isVerified });
            // Update the employer's verification status in the state
            setEmployer(prev => ({ ...prev, is_verified: isVerified }));
        } catch (err) {
            console.error('Failed to update verification status:', err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!employer) return <div>Employer not found</div>;

    return (
        <div className={`admin-employer-detail ${theme}`}>
            <header className="admin-header">
                <h1>Employer Details</h1>
                <div className="admin-header-actions">
                    <button className="back-button" onClick={() => navigate('/admin/employers')}>
                        <FiArrowLeft /> Back to Employers
                    </button>
                    <button className="dashboard-button" onClick={() => navigate('/admin/dashboard')}>
                        <FiHome /> Dashboard
                    </button>
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
                <div className="employer-detail-card">
                    {/* User Info Section */}
                    <div className="user-info-section">
                        <div className="user-name">
                            <h2>{employer.name}</h2>
                        </div>
                        <div className="user-email">
                            <p>{employer.email}</p>
                        </div>
                    </div>

                    {/* Company Verification Status */}
                    <div className="verification-status-section">
                        {employer.is_verified ? (
                            <span className="verified-status">
                                <FiCheckCircle className="verified-icon" /> Company Verified
                            </span>
                        ) : (
                            <span className="unverified-status">
                                <FiXCircle className="unverified-icon" /> Company Not Verified
                            </span>
                        )}
                    </div>

                    {/* Personal Information Section */}
                    <div className="info-section">
                        <h3 className="section-title">Personal Information</h3>
                        <div className="field-grid">
                            <div className="field-row">
                                <label className="field-label">Full Name</label>
                                <span className="field-value">{employer.name}</span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Email</label>
                                <span className="field-value">{employer.email}</span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Phone</label>
                                <span className="field-value">{employer.phone || 'Not provided'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Company Information Section */}
                    <div className="info-section">
                        <h3 className="section-title">Company Information</h3>
                        <div className="field-grid">
                            <div className="field-row">
                                <label className="field-label">Company Name</label>
                                <span className="field-value">{employer.companyName || 'Not provided'}</span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Company Location</label>
                                <span className="field-value">{employer.companyLocation || 'Not provided'}</span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Company Size</label>
                                <span className="field-value">{employer.employeesCount ? `${employer.employeesCount} employees` : 'Not specified'}</span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Established Year</label>
                                <span className="field-value">{employer.establishmentYear || 'Not provided'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Account Information Section */}
                    <div className="info-section">
                        <h3 className="section-title">Account Information</h3>
                        <div className="field-grid">
                            <div className="field-row">
                                <label className="field-label">Member Since</label>
                                <span className="field-value">{new Date(employer.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Last Updated</label>
                                <span className="field-value">{new Date(employer.updated_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Verification Actions */}
                    <div className="verification-actions">
                        {!employer.is_verified && (
                            <button
                                className="verify-button"
                                onClick={() => handleVerifyEmployer(employer.id, true)}
                            >
                                <FiCheckCircle /> Verify Company
                            </button>
                        )}
                        {employer.is_verified && (
                            <button
                                className="unverify-button"
                                onClick={() => handleVerifyEmployer(employer.id, false)}
                            >
                                <FiXCircle /> Unverify Company
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminEmployerDetail;
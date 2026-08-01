import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FiArrowLeft, FiUser, FiBriefcase, FiCalendar, FiCheckCircle, FiXCircle, FiLogOut, FiSun, FiMoon, FiHome, FiBell, FiFileText, FiMapPin, FiMail, FiPhone, FiClock, FiStar, FiTrendingUp } from 'react-icons/fi';
import '../../styles/pages/Admin/AdminApplicationDetail.css';

function AdminApplicationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [application, setApplication] = useState(null);
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
        const fetchApplication = async () => {
            try {
                // Since there's no specific application detail endpoint, we'll get all applications and find the one we need
                const response = await api.getAdminApplications();
                const applicationsData = Array.isArray(response.data?.data) ? response.data.data : [];
                const foundApplication = applicationsData.find(app => app.id == id);

                if (foundApplication) {
                    setApplication(foundApplication);
                } else {
                    setError('Application not found');
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch application details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchApplication();
        }
    }, [id]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleUpdateStatus = async (applicationId, newStatus) => {
        try {
            await api.updateAdminApplication(applicationId, { status: newStatus });
            // Update the application's status in the state
            setApplication(prev => ({ ...prev, status: newStatus }));
        } catch (err) {
            console.error('Failed to update application status:', err);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            applied: { color: '#3b82f6', icon: FiFileText, text: 'Applied' },
            shortlisted: { color: '#f59e0b', icon: FiCheckCircle, text: 'Shortlisted' },
            rejected: { color: '#ef4444', icon: FiXCircle, text: 'Rejected' },
            hired: { color: '#10b981', icon: FiCheckCircle, text: 'Hired' }
        };

        const config = statusConfig[status?.toLowerCase()] || statusConfig.applied;
        const IconComponent = config.icon;

        return (
            <span className="status-badge" style={{ backgroundColor: config.color }}>
                <IconComponent className="status-icon" />
                {config.text}
            </span>
        );
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!application) return <div>Application not found</div>;

    return (
        <div className={`admin-application-detail ${theme}`}>
            <header className="admin-header">
                <h1>Application Details</h1>
                <div className="admin-header-actions">
                    <button className="back-button" onClick={() => navigate('/admin/applications')}>
                        <FiArrowLeft /> Back to Applications
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
                <div className="application-detail-card">
                    <div className="application-header">
                        <div className="application-avatar">
                            <FiBriefcase />
                        </div>
                        <div className="application-info">
                            <h2>{application.job?.title || 'Job Title'}</h2>
                            <p className="application-subtitle">
                                <FiUser className="subtitle-icon" />
                                Applied by {application.user?.name || 'Unknown Applicant'}
                            </p>
                            <p className="application-company">
                                <FiTrendingUp className="subtitle-icon" />
                                {application.job?.companyName || 'Company Not Specified'}
                            </p>
                            <div className="application-status">
                                {getStatusBadge(application.status)}
                            </div>
                        </div>
                    </div>

                    {/* Job Information Section */}
                    <div className="info-section">
                        <h3 className="section-title">Job Information</h3>
                        <div className="field-grid">
                            <div className="field-row">
                                <label className="field-label">Job Title</label>
                                <span className="field-value">{application.job?.title || 'Not available'}</span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Company</label>
                                <span className="field-value">{application.job?.companyName || 'Not available'}</span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Location</label>
                                <span className="field-value">{application.job?.location || 'Not available'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Applicant Information Section */}
                    <div className="info-section">
                        <h3 className="section-title">👤 Applicant Information</h3>
                        <div className="field-grid">
                            <div className="field-row">
                                <label className="field-label">Full Name</label>
                                <span className="field-value">{application.user?.name || 'Not available'}</span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Email</label>
                                <span className="field-value">{application.user?.email || 'Not available'}</span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Phone</label>
                                <span className="field-value">{application.user?.phone || 'Not provided'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Application Timeline Section */}
                    <div className="info-section">
                        <h3 className="section-title">📋 Application Timeline</h3>
                        <div className="field-grid">
                            <div className="field-row">
                                <label className="field-label">Application Date</label>
                                <span className="field-value">{new Date(application.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Last Updated</label>
                                <span className="field-value">{new Date(application.updated_at).toLocaleDateString()}</span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Application ID</label>
                                <span className="field-value">#{application.id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Verification Actions */}
                    <div className="verification-actions">
                        {application.status !== 'hired' && (
                            <>
                                {application.status !== 'shortlisted' && (
                                    <button
                                        className="verify-button"
                                        onClick={() => handleUpdateStatus(application.id, 'shortlisted')}
                                    >
                                        <FiStar /> Shortlist Candidate
                                    </button>
                                )}
                                {application.status !== 'rejected' && (
                                    <button
                                        className="verify-button reject"
                                        onClick={() => handleUpdateStatus(application.id, 'rejected')}
                                    >
                                        <FiXCircle /> Reject Application
                                    </button>
                                )}
                                {application.status !== 'hired' && (
                                    <button
                                        className="verify-button hire"
                                        onClick={() => handleUpdateStatus(application.id, 'hired')}
                                    >
                                        <FiCheckCircle /> Hire Candidate
                                    </button>
                                )}
                            </>
                        )}
                        {application.status === 'hired' && (
                            <div className="hired-notice">
                                <FiCheckCircle className="hired-icon" />
                                <span>This candidate has been hired</span>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminApplicationDetail;
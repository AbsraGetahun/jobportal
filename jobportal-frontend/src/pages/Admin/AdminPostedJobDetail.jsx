import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FiBriefcase, FiMapPin, FiDollarSign, FiCalendar, FiUser, FiMail, FiPhone, FiCheckCircle, FiXCircle, FiClock, FiLogOut, FiSun, FiMoon, FiBell, FiHome, FiStar, FiTrendingUp, FiFileText, FiArrowLeft } from 'react-icons/fi';

function AdminPostedJobDetail() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [job, setJob] = useState(null);
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
        const fetchJob = async () => {
            try {
                const response = await api.get(`/admin/jobs/${jobId}`);
                // Handle both nested and direct response structures
                const jobData = response.data?.data || response.data;
                setJob(jobData);
            } catch (err) {
                setError(err.message || 'Failed to fetch job details');
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [jobId]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleApproveJob = async (isApproved) => {
        try {
            const status = isApproved ? 'approved' : 'rejected';
            await api.put(`/admin/jobs/${jobId}`, { status });
            setJob(prevJob => ({ ...prevJob, status: status }));
        } catch (err) {
            console.error('Failed to update job approval status:', err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!job) return <div>Job not found</div>;

    return (
        <div className={`admin-job-detail ${theme}`}>
            <header className="admin-header">
                <h1>Job Details</h1>
                <div className="admin-header-actions">
                    <button className="back-button" onClick={() => navigate('/admin/jobs')}>
                        <FiArrowLeft /> Back to Jobs
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
                <div className="job-detail-card">
                    {/* Job Info Section */}
                    <div className="user-info-section">
                        <div className="user-name">
                            <h2>{job.title || 'Untitled Job'}</h2>
                        </div>
                        <div className="user-email">
                            <p>{job.employer?.name || 'Company Not Specified'}</p>
                        </div>
                    </div>

                    {/* Job Status Section */}
                    <div className="verification-status-section">
                        {job.status === 'approved' ? (
                            <span className="verified-status">
                                <FiCheckCircle className="verified-icon" /> Job Approved
                            </span>
                        ) : job.status === 'rejected' ? (
                            <span className="unverified-status">
                                <FiXCircle className="unverified-icon" /> Job Rejected
                            </span>
                        ) : (
                            <span className="unverified-status">
                                <FiClock className="unverified-icon" /> Pending Review
                            </span>
                        )}
                    </div>

                    {/* Job Information Section */}
                    <div className="info-section">
                        <h3 className="section-title">Job Information</h3>
                        <div className="field-grid">
                            <div className="field-row">
                                <label className="field-label">Job Title</label>
                                <span className="field-value">{job.title || 'Not specified'}</span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Company</label>
                                <span className="field-value">{job.employer?.name || 'Not specified'}</span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Location</label>
                                <span className="field-value">{job.location || 'Not specified'}</span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Category</label>
                                <span className="field-value">{job.category || 'Not specified'}</span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Job Type</label>
                                <span className="field-value">{job.job_type || 'Not specified'}</span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Remote Work</label>
                                <span className="field-value">{job.is_remote ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Job Requirements Section */}
                    <div className="info-section">
                        <h3 className="section-title">Job Requirements</h3>
                        <div className="field-grid">
                            <div className="field-row">
                                <label className="field-label">Experience Level</label>
                                <span className="field-value">{job.experience_level || 'Not specified'}</span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Salary Range</label>
                                <span className="field-value">
                                    {job.salary_min && job.salary_max
                                        ? `${job.salary_min} - ${job.salary_max} ${job.salary_type || 'ETB'}`
                                        : 'Negotiable'
                                    }
                                </span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Application Deadline</label>
                                <span className="field-value">
                                    {job.application_deadline
                                        ? new Date(job.application_deadline).toLocaleDateString()
                                        : 'No deadline set'
                                    }
                                </span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Active Status</label>
                                <span className="field-value">{job.is_active ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Job Description Section */}
                    <div className="info-section">
                        <h3 className="section-title">Job Description</h3>
                        <div className="description-content">
                            <p>{job.description || 'No description provided.'}</p>
                        </div>
                    </div>

                    {/* Account Information Section */}
                    <div className="info-section">
                        <h3 className="section-title">Account Information</h3>
                        <div className="field-grid">
                            <div className="field-row">
                                <label className="field-label">Posted Date</label>
                                <span className="field-value">
                                    {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Not available'}
                                </span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Last Updated</label>
                                <span className="field-value">
                                    {job.updated_at ? new Date(job.updated_at).toLocaleDateString() : 'Not available'}
                                </span>
                            </div>
                            <div className="field-row">
                                <label className="field-label">Employer ID</label>
                                <span className="field-value">{job.employer_id || 'Not available'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Job Actions */}
                    <div className="verification-actions">
                        {job.status !== 'approved' && (
                            <button
                                className="verify-button"
                                onClick={() => handleApproveJob(true)}
                            >
                                <FiCheckCircle /> Approve Job
                            </button>
                        )}
                        {job.status !== 'rejected' && (
                            <button
                                className="unverify-button"
                                onClick={() => handleApproveJob(false)}
                            >
                                <FiXCircle /> Reject Job
                            </button>
                        )}
                        <button
                            className="back-button"
                            onClick={() => navigate('/admin/jobs')}
                        >
                            <FiArrowLeft /> Back to Jobs
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminPostedJobDetail;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCheckCircle, FiXCircle, FiLogOut, FiSun, FiMoon, FiHome, FiBell, FiBriefcase, FiBookOpen } from 'react-icons/fi';
import '../../styles/pages/Admin/AdminJobSeekerDetail.css';

function AdminJobSeekerDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [jobSeeker, setJobSeeker] = useState(null);
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
        const fetchJobSeeker = async () => {
            try {
                // Since there's no specific job seeker detail endpoint, we'll get all job seekers and find the one we need
                const response = await api.getAdminJobSeekers();
                const jobSeekersData = Array.isArray(response.data?.data) ? response.data.data : [];
                const foundJobSeeker = jobSeekersData.find(js => js.id == id);

                if (foundJobSeeker) {
                    setJobSeeker(foundJobSeeker);
                } else {
                    setError('Job seeker not found');
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch job seeker details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchJobSeeker();
        }
    }, [id]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleVerifyJobSeeker = async (jobSeekerId, isVerified) => {
        try {
            await api.put(`/admin/jobseekers/${jobSeekerId}/verify`, { is_verified: isVerified });
            // Update the job seeker's verification status in the state
            setJobSeeker(prev => ({ ...prev, is_verified: isVerified }));
        } catch (err) {
            console.error('Failed to update verification status:', err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!jobSeeker) return <div>Job seeker not found</div>;

    return (
        <div className={`admin-jobseeker-detail ${theme}`}>
            <header className="admin-header">
                <h1>Job Seeker Details</h1>
                <div className="admin-header-actions">
                    <button className="back-button" onClick={() => navigate('/admin/jobseekers')}>
                        <FiArrowLeft /> Back to Job Seekers
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
                <div className="jobseeker-detail-card">
                    <div className="jobseeker-header">
                        <div className="jobseeker-avatar">
                            <FiUser />
                        </div>
                        <div className="jobseeker-info">
                            <h2>{jobSeeker.name}</h2>
                            <p className="jobseeker-email">{jobSeeker.email}</p>
                            <div className="jobseeker-status">
                                {jobSeeker.is_verified ? (
                                    <span className="verified-status">
                                        <FiCheckCircle className="verified-icon" /> Verified
                                    </span>
                                ) : (
                                    <span className="unverified-status">
                                        <FiXCircle className="unverified-icon" /> Not Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="jobseeker-details-grid">
                        <div className="detail-section">
                            <h3>Personal Information</h3>
                            <div className="detail-item">
                                <FiUser className="detail-icon" />
                                <div>
                                    <label>Full Name</label>
                                    <p>{jobSeeker.name}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FiMail className="detail-icon" />
                                <div>
                                    <label>Email</label>
                                    <p>{jobSeeker.email}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FiPhone className="detail-icon" />
                                <div>
                                    <label>Phone</label>
                                    <p>{jobSeeker.phone || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FiMapPin className="detail-icon" />
                                <div>
                                    <label>Location</label>
                                    <p>{jobSeeker.location || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3>Education & Experience</h3>
                            <div className="detail-item">
                                <FiBookOpen className="detail-icon" />
                                <div>
                                    <label>Degree</label>
                                    <p>{jobSeeker.degree || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FiBookOpen className="detail-icon" />
                                <div>
                                    <label>Field of Study</label>
                                    <p>{jobSeeker.fieldOfStudy || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FiCalendar className="detail-icon" />
                                <div>
                                    <label>Graduation Year</label>
                                    <p>{jobSeeker.graduationYear || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FiBriefcase className="detail-icon" />
                                <div>
                                    <label>Experience</label>
                                    <p>{jobSeeker.experience ? `${jobSeeker.experience} years` : 'Not provided'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3>Account Information</h3>
                            <div className="detail-item">
                                <FiCalendar className="detail-icon" />
                                <div>
                                    <label>Member Since</label>
                                    <p>{new Date(jobSeeker.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <FiCalendar className="detail-icon" />
                                <div>
                                    <label>Last Updated</label>
                                    <p>{new Date(jobSeeker.updated_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="jobseeker-actions">
                        {!jobSeeker.is_verified && (
                            <button
                                className="verify-button"
                                onClick={() => handleVerifyJobSeeker(jobSeeker.id, true)}
                            >
                                <FiCheckCircle /> Verify Job Seeker
                            </button>
                        )}
                        {jobSeeker.is_verified && (
                            <button
                                className="unverify-button"
                                onClick={() => handleVerifyJobSeeker(jobSeeker.id, false)}
                            >
                                <FiXCircle /> Unverify Job Seeker
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminJobSeekerDetail;
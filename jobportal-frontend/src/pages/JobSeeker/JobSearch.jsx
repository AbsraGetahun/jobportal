import React from 'react';

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiBell, FiLogOut, FiSun, FiMoon, FiHeart } from 'react-icons/fi';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/JobSeeker/JobSearch.css';

import api from '../../api';

const JobSearch = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [savedJobs, setSavedJobs] = useState(new Set());
    const [saveLoading, setSaveLoading] = useState(new Set());
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Theme logic
    const [scrolled, setScrolled] = useState(false);
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
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };
    
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleViewNotifications = () => {
        // Navigate to the notifications page
        navigate('/notificationlist');
    };

    // Fetch jobs from API
    useEffect(() => {
  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log('Fetching jobs with search term:', searchTerm);
      const response = await api.getJobs({ search: searchTerm });
      console.log('API Response:', response);
      // Handle pagination response - response.data.data contains the actual array
      // The structure is: response.data = { data: [...jobs], current_page: 1, ... }
      const jobsData = response.data?.data?.data || []; // Extract jobs from pagination
      console.log('Jobs data:', jobsData);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simple debounce
  const timer = setTimeout(fetchJobs, 300);
  return () => clearTimeout(timer);
}, [searchTerm]);

    // Fetch notification count
    useEffect(() => {
        const fetchNotificationCount = async () => {
            try {
                const response = await api.getNotifications();
                const unreadCount = Array.isArray(response.data)
                    ? response.data.filter(notification => !notification.is_read).length
                    : 0;
                setNotificationCount(unreadCount);
            } catch (error) {
                console.error('Error fetching notification count:', error);
            }
        };

        fetchNotificationCount();

        // Refresh notification count every 30 seconds
        const interval = setInterval(fetchNotificationCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Fetch saved jobs status
    useEffect(() => {
        const fetchSavedJobsStatus = async () => {
            try {
                const response = await api.getSavedJobs();
                const savedJobIds = new Set(response.data?.data?.data?.map(job => job.id) || []);
                setSavedJobs(savedJobIds);
            } catch (error) {
                console.error('Error fetching saved jobs status:', error);
            }
        };

        if (jobs.length > 0) {
            fetchSavedJobsStatus();
        }
    }, [jobs]);

    const handleSaveJob = async (jobId) => {
        if (saveLoading.has(jobId)) return;

        setSaveLoading(prev => new Set(prev).add(jobId));

        try {
            if (savedJobs.has(jobId)) {
                await api.unsaveJob(jobId);
                setSavedJobs(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(jobId);
                    return newSet;
                });
            } else {
                await api.saveJob(jobId);
                setSavedJobs(prev => new Set(prev).add(jobId));
            }
        } catch (error) {
            console.error('Error saving/unsaving job:', error);
            // You could add a toast notification here
        } finally {
            setSaveLoading(prev => {
                const newSet = new Set(prev);
                newSet.delete(jobId);
                return newSet;
            });
        }
    };

    // Format date from backend
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    
    const showJobDetails = (job) => {
        setSelectedJob(job);
        setIsDetailOpen(true);
    };

    const closeJobDetails = () => {
        setIsDetailOpen(false);
        setTimeout(() => setSelectedJob(null), 300);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className={`careerplus-jobsearch-root ${theme}`}>

            {/* Header */}
            <motion.header
                className={`careerplus__header ${scrolled ? 'scrolled' : ''}`}
                initial={{ backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}
                animate={{
                    backgroundColor: scrolled
                        ? (theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)')
                        : (theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)')
                }}
                transition={{ duration: 0.3 }}
            >
                <div className="careerplus__header-container">
                    <motion.h1
                        className="careerplus__logo"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        CareerPlus
                    </motion.h1>
                    <nav className="careerplus__nav">
                        <button className="careerplus__nav-icon" title="Notifications" onClick={handleViewNotifications}>
                            <FiBell />
                            {notificationCount > 0 && (
                                <span className="notification-badge">
                                    {notificationCount}
                                </span>
                            )}
                        </button>
                        <button className="careerplus__nav-icon" title="Account" onClick={() => navigate('/jobseekeraccount')}>
                            <FiUser />
                        </button>
                        <button className="careerplus__nav-icon" title="Logout" onClick={handleLogout}>
                            <FiLogOut />
                        </button>
                        <button
                            className="careerplus__theme-toggle"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                        >
                            {theme === 'light' ? <FiMoon /> : <FiSun />}
                        </button>
                    </nav>
                </div>
            </motion.header>

            <main className="careerplus-jobsearch-main">
                <div className="job-search-page">
                    <div className="search-container">
                        <h1>Find Your Dream Job</h1>
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search by job title, company, or category..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-spinner">
                            {/* Add loading spinner */}
                            Loading jobs...
                        </div>
                    ) : (
                        <div className="job-listings">
                            {jobs.length > 0 ? (
                                jobs.map(job => (
                                    <div key={job.id} className="job-card">
                                        <div className="job-card-header">
                                            <h2>{job.title}</h2>
                                            <div className="job-card-actions">
                                                <button
                                                    className={`save-job-btn ${savedJobs.has(job.id) ? 'saved' : ''}`}
                                                    onClick={() => handleSaveJob(job.id)}
                                                    disabled={saveLoading.has(job.id)}
                                                    title={savedJobs.has(job.id) ? 'Unsave job' : 'Save job'}
                                                >
                                                    <FiHeart className={savedJobs.has(job.id) ? 'filled' : ''} />
                                                </button>
                                                <span className="company-name">
                                                    {job.employer?.name || 'Unknown Company'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="job-card-body">
                                            <div className="job-info">
                                                <div className="info-item">
                                                    <span className="info-label">Location</span>
                                                    <span>{job.location || 'Not specified'}</span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-label">Posted</span>
                                                    <span>{formatDate(job.created_at)}</span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-label">Salary</span>
                                                    <span>
                                                        {job.salary_min ? `$${job.salary_min}` : 'Not specified'} - {job.salary_max ? `$${job.salary_max}` : 'Not specified'}
                                                    </span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-label">Category</span>
                                                    <span className="category-tag">
                                                        {job.category?.charAt(0).toUpperCase() + job.category?.slice(1) || 'Other'}
                                                    </span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-label">Deadline</span>
                                                    <span>{formatDate(job.application_deadline)}</span>
                                                </div>
                                            </div>
                                            <button
                                                className="details-button"
                                                onClick={() => showJobDetails(job)}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-results">
                                    <p>No jobs found matching your search criteria.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Job Details Modal */}
                    {selectedJob && (
                        <div className={`job-details-modal ${isDetailOpen ? 'open' : ''}`}>
                            <div className="modal-content">
                                <div className="modal-header">
                                    <div className="modal-title-section">
                                        <h2>{selectedJob.title}</h2>
                                        <h3>{selectedJob.employer?.name || 'Unknown Company'}</h3>
                                    </div>
                                    <div className="modal-actions-top">
                                        <button
                                            className={`save-job-btn ${savedJobs.has(selectedJob.id) ? 'saved' : ''}`}
                                            onClick={() => handleSaveJob(selectedJob.id)}
                                            disabled={saveLoading.has(selectedJob.id)}
                                            title={savedJobs.has(selectedJob.id) ? 'Unsave job' : 'Save job'}
                                        >
                                            <FiHeart className={savedJobs.has(selectedJob.id) ? 'filled' : ''} />
                                        </button>
                                        <button className="close-button" onClick={closeJobDetails}>×</button>
                                    </div>
                                </div>

                                <div className="detail-section">
                                    <div className="detail-row">
                                        <span className="detail-label">Job ID</span>
                                        <span>{selectedJob.id}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Job Type</span>
                                        <span>{selectedJob.job_type?.charAt(0).toUpperCase() + selectedJob.job_type?.slice(1) || 'Not specified'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Experience Level</span>
                                        <span>
                                            {selectedJob.experience_level?.charAt(0).toUpperCase() + selectedJob.experience_level?.slice(1) || 'Not specified'}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Location</span>
                                        <span>{selectedJob.location || 'Not specified'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Salary</span>
                                        <span>
                                            {selectedJob.salary_min ? `$${selectedJob.salary_min}` : 'Not specified'} - {selectedJob.salary_max ? `$${selectedJob.salary_max}` : 'Not specified'}
                                        </span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Category</span>
                                        <span>{selectedJob.category?.charAt(0).toUpperCase() + selectedJob.category?.slice(1) || 'Not specified'}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Deadline</span>
                                        <span>{formatDate(selectedJob.application_deadline)}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Remote Position</span>
                                        <span>{selectedJob.is_remote ? 'Yes' : 'No'}</span>
                                    </div>
                                </div>

                                <div className="description-section">
                                    <h4>Job Description</h4>
                                    <p>{selectedJob.description || 'No description provided.'}</p>
                                </div>

                                <div className="modal-actions">
                                    <button
                                        className="apply-button"
                                        onClick={() => {
                                            console.log('JobSearch: Navigating to job application with jobId:', selectedJob.id);
                                            navigate(`/jobapplication/${selectedJob.id}`);
                                        }}
                                    >
                                        Apply Now
                                    </button>
                                    <button className="cancel-button" onClick={closeJobDetails}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* footer */}
            <motion.footer id="contact" className="careerplus__footer"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="careerplus__footer-container">
                    <div className="careerplus__footer-brand">
                        <h3 className="careerplus__logo">CareerPlus</h3>
                        <p className="careerplus__footer-text">
                            AI-powered job matching for the modern professional.
                        </p>
                    </div>
                    <div className="careerplus__footer-links">
                        <h4 className="careerplus__footer-heading">Quick Links</h4>
                        <a href="/" className="careerplus__footer-link">Home</a>
                        <a href="/jobseekeraccount" className="careerplus__footer-link">Account</a>
                        <a href="/notificationlist" className="careerplus__footer-link">Notifications</a>
                    </div>
                    <div className="careerplus__footer-contact">
                        <h4 className="careerplus__footer-heading">Contact Us</h4>
                        <p className="careerplus__footer-text">hello@careerplus.com</p>
                        <p className="careerplus__footer-text">+251 (9) 123-456</p>
                    </div>
                    <div className="careerplus__footer-social">
                        <h4 className="careerplus__footer-heading">Follow Us</h4>
                        <div className="careerplus__social-icons">
                            <a href="#" className="careerplus__social-icon"><FaLinkedin /></a>
                            <a href="#" className="careerplus__social-icon"><FaTwitter /></a>
                            <a href="#" className="careerplus__social-icon"><FaGithub /></a>
                        </div>
                    </div>
                </div>
                <div className="careerplus__footer-bottom">
                    <p>&copy; {new Date().getFullYear()} CareerPlus. All rights reserved.</p>
                </div>
            </motion.footer>
        </div>
    );
};

export default JobSearch;
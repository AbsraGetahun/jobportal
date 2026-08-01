import React from 'react';

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUpload, FiPaperclip, FiCheckCircle, FiSun, FiMoon, FiLogOut, FiSearch } from 'react-icons/fi';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import '../../styles/pages/JobSeeker/JobApplication.css';

const JobApplication = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        introduction: '',
        additional_skills: '',
        certificate: null
    });
    const [jobDetails, setJobDetails] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return savedTheme;
    });
    const { logout } = useAuth();

    // Theme handling
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Scroll handling
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

    // Fetch job details
    useEffect(() => {
        console.log('JobApplication: jobId from URL:', jobId);
        const fetchJobDetails = async () => {
            try {
                const response = await api.getJobDetails(jobId);
                console.log('JobApplication: job details response:', response.data);
                setJobDetails(response.data);
            } catch (err) {
                console.error('Error fetching job details:', err);
                if (err.response && err.response.status === 404) {
                    setError('The requested job is no longer available.');
                } else {
                    setError('Failed to load job details. Please try again later.');
                }
            }
        };

        if (jobId) {
            fetchJobDetails();
        }
    }, [jobId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, certificate: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Validate cover letter length
            if (formData.introduction.length < 50) {
                throw new Error('Introduction must be at least 50 characters long.');
            }
            
            const formDataToSend = new FormData();
            formDataToSend.append('job_id', jobId);
            formDataToSend.append('cover_letter', formData.introduction);
            
            if (formData.certificate) {
                formDataToSend.append('resume', formData.certificate);
            }

            const response = await api.submitApplication(formDataToSend);
            
            if (response.status === 201) {
                setShowSuccess(true);
                setTimeout(() => navigate('/jobsearch'), 3000);
            } else {
                throw new Error('Failed to submit application');
            }
        } catch (err) {
            console.error('Application error:', err);
            if (err.response && err.response.status === 404) {
                setError('The job you are applying for is no longer available.');
            } else if (err.response && err.response.status === 400) {
                setError(err.response.data.message || 'Invalid application data. Please check your input.');
            } else if (err.response && err.response.status === 422) {
                // Handle validation errors
                const validationErrors = err.response.data.errors;
                if (validationErrors) {
                    const errorMessages = Object.values(validationErrors).flat();
                    setError(errorMessages[0] || 'Invalid application data. Please check your input.');
                } else {
                    setError('Invalid application data. Please check your input.');
                }
            } else {
                setError(err.response?.data?.message || 'Application failed. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!jobDetails) {
        if (!jobId) {
            return (
                <div className="careerplus-jobapplication-loading">
                    <p>No job selected.</p>
                    <button className="careerplus-jobapplication-btn" onClick={() => navigate('/jobsearch')}>
                        Browse Jobs
                    </button>
                </div>
            );
        }
        return <div className="careerplus-jobapplication-loading">Loading job details...</div>;
    }

    return (
        <div className={`careerplus-jobapplication-root ${theme}`}>
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
                        <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>CareerPlus</a>
                    </motion.h1>
                    <nav className="careerplus__nav">
                        <button className="careerplus__nav-icon" title="Search Jobs" onClick={() => navigate('/jobsearch')}>
                            <FiSearch />
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

            {/* Main Content */}
            <main className="careerplus-jobapplication-main">
                <motion.section
                    className="careerplus-jobapplication-card glass-card"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="careerplus-jobapplication-title">Apply for {jobDetails.title}</h1>
                    <p className="careerplus-jobapplication-subtitle">
                        {jobDetails.employer?.name || 'Unknown Company'}
                    </p>

                    {showSuccess && (
                        <div className="careerplus-jobapplication-success">
                            <FiCheckCircle className="success-icon" />
                            <p>Application submitted successfully! Redirecting...</p>
                        </div>
                    )}

                    {error && <div className="careerplus-jobapplication-error">{error}</div>}
                    
                    <div className="character-count">
                        Introduction length: {formData.introduction.length}/50 characters minimum
                    </div>

                    <form onSubmit={handleSubmit} className="careerplus-jobapplication-form">
                        <div className="form-group">
                            <label htmlFor="introduction" className="careerplus-jobapplication-label">
                                Introduction * (Minimum 50 characters)
                            </label>
                            <textarea
                                id="introduction"
                                name="introduction"
                                value={formData.introduction}
                                onChange={handleChange}
                                required
                                className="careerplus-jobapplication-input"
                                placeholder="Tell us about yourself and why you're a great fit"
                                autoComplete="on"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="additional_skills" className="careerplus-jobapplication-label">
                                Additional Skills
                            </label>
                            <textarea
                                id="additional_skills"
                                name="additional_skills"
                                value={formData.additional_skills}
                                onChange={handleChange}
                                className="careerplus-jobapplication-input"
                                placeholder="List any additional skills relevant to the job"
                                autoComplete="on"
                            />
                        </div>

                        <div className="form-group">
                            <label className="careerplus-jobapplication-label">Certificate (Optional)</label>
                            <div className="file-upload">
                                <label className="upload-label">
                                    <FiUpload className="upload-icon" />
                                    <span>{formData.certificate ? formData.certificate.name : 'Upload Certificate'}</span>
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                    />
                                </label>
                                {formData.certificate && (
                                    <button
                                        type="button"
                                        className="remove-file"
                                        onClick={() => setFormData(prev => ({ ...prev, certificate: null }))}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            <p className="file-hint">Accepted formats: PDF, DOC, DOCX (Max 5MB)</p>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="careerplus-jobapplication-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </motion.section>
            </main>

            {/* Footer */}
            <motion.footer
                className="careerplus__footer"
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
                        <a href="/login" className="careerplus__footer-link">Login</a>
                        <a href="/register" className="careerplus__footer-link">Register</a>
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
                    <p>© {new Date().getFullYear()} CareerPlus. All rights reserved.</p>
                </div>
            </motion.footer>
        </div>
    );
};

export default JobApplication;
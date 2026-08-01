import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBookmark, FiBriefcase, FiMapPin, FiDollarSign, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const SavedJobs = () => {
    const navigate = useNavigate();
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSavedJobs = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.getSavedJobs();
                console.log('Saved jobs response:', response);
                // Handle pagination response structure
                const jobsData = response.data?.data?.data || response.data?.data || [];
                setSavedJobs(Array.isArray(jobsData) ? jobsData : []);
            } catch (error) {
                console.error('Error fetching saved jobs:', error);
                setError('Failed to load saved jobs. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchSavedJobs();
    }, []);

    const handleUnsaveJob = async (jobId) => {
        try {
            await api.unsaveJob(jobId);
            // Remove the job from local state
            setSavedJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
        } catch (error) {
            console.error('Error unsaving job:', error);
            setError('Failed to unsave job. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="saved-jobs-loading">
                <p>Loading your saved jobs...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="saved-jobs-error">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return (
        <div className="saved-jobs">
            <h3>Saved Jobs</h3>
            <p className="saved-jobs-subtitle">Jobs you've saved for later</p>
            
            {savedJobs.length === 0 ? (
                <div className="empty-saved-jobs">
                    <FiBookmark className="bookmark-icon" />
                    <p>You haven't saved any jobs yet</p>
                    <p className="instructions">Save jobs by clicking the bookmark icon on job listings</p>
                </div>
            ) : (
                <div className="saved-jobs-list">
                    {savedJobs.map((job) => (
                        <motion.div
                            key={job.id}
                            className="saved-job-card"
                            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="saved-job-header">
                                <div className="company-logo-placeholder">
                                    {job.employer?.name?.charAt(0) || job.company?.charAt(0) || 'C'}
                                </div>
                                <div className="job-info">
                                    <h4>{job.title}</h4>
                                    <p className="company-name">{job.employer?.name || job.company || 'Unknown Company'}</p>
                                </div>
                                <button
                                    className="remove-saved-btn"
                                    onClick={() => handleUnsaveJob(job.id)}
                                    title="Remove from saved jobs"
                                >
                                    <FiBookmark className="bookmarked-icon" />
                                </button>
                            </div>
                            
                            <div className="job-details">
                                <div className="detail-item">
                                    <FiMapPin className="detail-icon" />
                                    <span>{job.location || 'Not specified'}</span>
                                </div>
                                <div className="detail-item">
                                    <FiDollarSign className="detail-icon" />
                                    <span>
                                        {job.salary_min ? `$${job.salary_min}` : 'Not specified'}
                                        {job.salary_max ? ` - $${job.salary_max}` : ''}
                                    </span>
                                </div>
                                <div className="detail-item">
                                    <FiBriefcase className="detail-icon" />
                                    <span>{job.job_type?.charAt(0).toUpperCase() + job.job_type?.slice(1) || 'Not specified'}</span>
                                </div>
                                <div className="detail-item">
                                    <FiClock className="detail-icon" />
                                    <span>{job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            </div>
                            
                            <div className="saved-job-actions">
                                <button
                                    className="view-details-btn"
                                    onClick={() => navigate(`/jobapplication/${job.id}`)}
                                >
                                    View Details
                                </button>
                                <button
                                    className="apply-btn"
                                    onClick={() => navigate(`/jobapplication/${job.id}`)}
                                >
                                    Apply Now
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SavedJobs;
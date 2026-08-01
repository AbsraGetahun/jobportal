import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiMapPin, FiDollarSign, FiClock, FiArrowRight, FiSearch, FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const JobNotification = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [jobTypeFilter, setJobTypeFilter] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                // Fetch jobs with filters
                const response = await api.getJobs({
                    search: searchTerm,
                    location: locationFilter,
                    job_type: jobTypeFilter,
                    per_page: 12
                });
                
                // Check the structure of the response
                if (response && response.data) {
                    // Handle paginated response from Laravel
                    if (response.data.data && Array.isArray(response.data.data)) {
                        setJobs(response.data.data);
                    }
                    // Handle direct array response
                    else if (Array.isArray(response.data)) {
                        setJobs(response.data);
                    }
                    // Handle object response with jobs array
                    else if (response.data.jobs && Array.isArray(response.data.jobs)) {
                        setJobs(response.data.jobs);
                    }
                    // Handle any other object structure
                    else {
                        // Try to use the data directly if it's an array-like object
                        if (Array.isArray(Object.values(response.data))) {
                            const dataArray = Object.values(response.data);
                            if (dataArray.length > 0 && typeof dataArray[0] === 'object') {
                                setJobs(dataArray);
                            } else {
                                setJobs([]);
                            }
                        } else {
                            setJobs([]);
                        }
                    }
                } else {
                    setJobs([]);
                }
            } catch (err) {
                setError(err.message || 'Failed to fetch jobs');
                console.error('Error fetching jobs:', err);
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [searchTerm, locationFilter, jobTypeFilter]);

    const handleViewAllJobs = () => {
        navigate('/jobsearch');
    };

    const handleApply = (jobId) => {
        navigate(`/jobs/${jobId}/apply`);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // The useEffect will automatically fetch jobs with new filters
    };

    if (loading) {
        return (
            <section className="careerplus__job-notification">
                <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="careerplus__section-title"
                >
                    Latest Job Opportunities
                </motion.h3>
                <div className="careerplus__job-notification-container">
                    <div className="careerplus__job-notification-grid">
                        {[...Array(8)].map((_, index) => (
                            <div key={index} className="careerplus__job-card">
                                <div className="careerplus__job-card-header">
                                    <div className="careerplus__job-title skeleton-loader"></div>
                                    <div className="careerplus__job-company skeleton-loader" style={{ width: '60%', marginTop: '0.5rem' }}></div>
                                </div>
                                <div className="careerplus__job-details">
                                    <div className="careerplus__job-detail-item skeleton-loader" style={{ width: '80%' }}></div>
                                    <div className="careerplus__job-detail-item skeleton-loader" style={{ width: '70%', marginTop: '0.5rem' }}></div>
                                    <div className="careerplus__job-detail-item skeleton-loader" style={{ width: '90%', marginTop: '0.5rem' }}></div>
                                    <div className="careerplus__job-detail-item skeleton-loader" style={{ width: '60%', marginTop: '0.5rem' }}></div>
                                </div>
                                <div className="careerplus__job-card-footer">
                                    <div className="careerplus__job-posted skeleton-loader" style={{ width: '40%' }}></div>
                                    <div className="careerplus__job-apply-btn skeleton-loader" style={{ width: '80px', height: '32px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="careerplus__job-notification-more">
                    <button className="careerplus__job-notification-more-btn">
                        More Jobs <FiArrowRight />
                    </button>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="careerplus__job-notification">
                <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="careerplus__section-title"
                >
                    Latest Job Opportunities
                </motion.h3>
                <div className="careerplus__job-notification-container">
                    <div className="careerplus__job-notification-grid">
                        <div className="careerplus__job-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                <FiAlertCircle style={{ fontSize: '3rem', color: '#ef4444' }} />
                                <h4 style={{ margin: 0 }}>Unable to Load Jobs</h4>
                                <p style={{ margin: '0.5rem 0 1rem 0', color: 'var(--text-secondary)' }}>
                                    {error || 'An error occurred while fetching job listings.'}
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="careerplus__job-apply-btn"
                                    style={{ margin: '0 auto' }}
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="careerplus__job-notification-more">
                    <button className="careerplus__job-notification-more-btn" onClick={handleViewAllJobs}>
                        More Jobs <FiArrowRight />
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="careerplus__job-notification">
            <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="careerplus__section-title"
            >
                Latest Job Opportunities
            </motion.h3>

            {/* Search and Filter Section */}
            <div className="careerplus__job-search-filters">
                <form onSubmit={handleSearch} className="careerplus__search-form">
                    <div className="careerplus__search-input">
                        <FiSearch className="careerplus__search-icon" />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="careerplus__search-input-field"
                        />
                    </div>
                    <div className="careerplus__filter-select">
                        <select
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="careerplus__filter-select-field"
                        >
                            <option value="">All Locations</option>
                            <option value="Addis Ababa">Addis Ababa</option>
                            <option value="Dire Dawa">Dire Dawa</option>
                            <option value="Mekelle">Mekelle</option>
                        </select>
                    </div>
                    <div className="careerplus__filter-select">
                        <select
                            value={jobTypeFilter}
                            onChange={(e) => setJobTypeFilter(e.target.value)}
                            className="careerplus__filter-select-field"
                        >
                            <option value="">All Job Types</option>
                            <option value="full-time">Full-time</option>
                            <option value="part-time">Part-time</option>
                            <option value="contract">Contract</option>
                        </select>
                    </div>
                    <button type="submit" className="careerplus__search-btn">Search</button>
                </form>
            </div>

            <div className="careerplus__job-notification-container">
                <div className="careerplus__job-notification-grid">
                    {jobs && jobs.length > 0 ? (
                        jobs.map((job, index) => (
                            <motion.div
                                key={job.id || index}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                initial="hidden"
                                animate="visible"
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                className="careerplus__job-card"
                            >
                                <div className="careerplus__job-card-header">
                                    <h4 className="careerplus__job-title">{job.title || job.name || 'Job Title'}</h4>
                                    <span className="careerplus__job-company">
                                        {job.company?.name || job.employer?.companyName || job.employer?.name || 'Company Name'}
                                    </span>
                                </div>
                                <div className="careerplus__job-details">
                                    <div className="careerplus__job-detail-item">
                                        <FiMapPin className="careerplus__job-detail-icon" />
                                        <span>{job.location || 'Location not specified'}</span>
                                    </div>
                                    <div className="careerplus__job-detail-item">
                                        <FiDollarSign className="careerplus__job-detail-icon" />
                                        <span>
                                            {job.salary_min !== undefined && job.salary_max !== undefined && job.salary_min !== null && job.salary_max !== null
                                                ? `$${job.salary_min} - $${job.salary_max}`
                                                : job.salary_min !== undefined && job.salary_min !== null
                                                ? `$${job.salary_min}+`
                                                : job.salary_max !== undefined && job.salary_max !== null
                                                ? `Up to $${job.salary_max}`
                                                : 'Salary not specified'}
                                        </span>
                                    </div>
                                    <div className="careerplus__job-detail-item">
                                        <FiClock className="careerplus__job-detail-icon" />
                                        <span>
                                            {job.application_deadline || job.deadline
                                                ? `Deadline: ${new Date(job.application_deadline || job.deadline).toLocaleDateString()}`
                                                : 'No deadline specified'}
                                        </span>
                                    </div>
                                    <div className="careerplus__job-detail-item">
                                        <FiBriefcase className="careerplus__job-detail-icon" />
                                        <span>{job.category || job.job_type || 'Category not specified'}</span>
                                    </div>
                                </div>
                                <div className="careerplus__job-card-footer">
                                    <span className="careerplus__job-posted">
                                        Posted: {job.created_at || job.posted_at
                                            ? new Date(job.created_at || job.posted_at).toLocaleDateString()
                                            : 'Date not available'}
                                    </span>
                                    <button className="careerplus__job-apply-btn" onClick={() => handleApply(job.id)}>Apply</button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="careerplus__job-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                <FiBriefcase style={{ fontSize: '3rem', color: 'var(--text-secondary)' }} />
                                <h4 style={{ margin: 0 }}>No Jobs Available</h4>
                                <p style={{ margin: '0.5rem 0 1rem 0', color: 'var(--text-secondary)' }}>
                                    No jobs match your current filters. Try adjusting your search criteria.
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setLocationFilter('');
                                        setJobTypeFilter('');
                                    }}
                                    className="careerplus__job-apply-btn"
                                    style={{ margin: '0 auto' }}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="careerplus__job-notification-more">
                <button
                    className="careerplus__job-notification-more-btn"
                    onClick={handleViewAllJobs}
                >
                    More Jobs <FiArrowRight />
                </button>
            </div>
        </section>
    );
};

export default JobNotification;
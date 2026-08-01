import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiMapPin, FiDollarSign, FiClock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import '../../styles/components/JobSeeker/JobRecommendations.css';

const JobRecommendations = () => {
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const response = await api.getRecommendations({ limit: 12 });
                // Convert object with numeric keys to array
                const recommendationsData = response.data.data || {};
                const recommendationsArray = Object.values(recommendationsData);
                
                // Remove duplicates based on job title
                const uniqueRecommendations = recommendationsArray.filter((job, index, self) =>
                    index === self.findIndex((t) => t.title === job.title)
                );
                
                // Limit to 12 jobs
                const limitedRecommendations = uniqueRecommendations.slice(0, 12);
                
                setRecommendations(limitedRecommendations);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching recommendations:', err);
                setError('Failed to load job recommendations. Please try again later.');
                setLoading(false);
                
                // Fallback to mock data in case of error
                const mockRecommendations = [
                    {
                        id: 1,
                        title: "Senior Frontend Developer",
                        company: "TechCorp Inc.",
                        location: "Addis Ababa, Ethiopia",
                        salary: "$80,000 - $120,000",
                        type: "Full-time",
                        posted: "2 days ago",
                        match: 95
                    },
                    {
                        id: 2,
                        title: "Product Manager",
                        company: "Innovate Solutions",
                        location: "Remote",
                        salary: "$90,000 - $130,000",
                        type: "Full-time",
                        posted: "1 week ago",
                        match: 88
                    },
                    {
                        id: 3,
                        title: "UX/UI Designer",
                        company: "Creative Minds",
                        location: "Dire Dawa, Ethiopia",
                        salary: "$60,000 - $90,000",
                        type: "Contract",
                        posted: "3 days ago",
                        match: 82
                    },
                    {
                        id: 4,
                        title: "Data Analyst",
                        company: "Data Insights Co.",
                        location: "Hawassa, Ethiopia",
                        salary: "$70,000 - $100,000",
                        type: "Full-time",
                        posted: "5 days ago",
                        match: 78
                    },
                    {
                        id: 5,
                        title: "Marketing Specialist",
                        company: "Brand Builders",
                        location: "Bahir Dar, Ethiopia",
                        salary: "$50,000 - $80,000",
                        type: "Full-time",
                        posted: "1 day ago",
                        match: 75
                    },
                    {
                        id: 6,
                        title: "Software Engineer",
                        company: "Tech Innovations",
                        location: "Addis Ababa, Ethiopia",
                        salary: "$85,000 - $125,000",
                        type: "Full-time",
                        posted: "4 days ago",
                        match: 92
                    }
                ];
                
                // Remove duplicates from mock data
                const uniqueMockRecommendations = mockRecommendations.filter((job, index, self) =>
                    index === self.findIndex((t) => t.title === job.title)
                );
                
                setRecommendations(uniqueMockRecommendations);
            }
        };

        fetchRecommendations();
    }, []);

    if (loading) {
        return (
            <div className="recommendations-loading">
                <p>Finding the best jobs for you...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="recommendations-error">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="job-recommendations">
            <div className="recommendations-list">
                {recommendations.map((job) => (
                    <motion.div
                        key={job.id}
                        className="recommendation-card"
                        whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="recommendation-header">
                            <div className="company-logo-placeholder">
                                {job.company?.charAt(0) || 'C'}
                            </div>
                            <div className="job-info">
                                <h4>{job.title}</h4>
                                <p className="company-name">{job.company}</p>
                            </div>
                            {(job.relevance_score || job.match_score || job.similarity_score) && (
                                <div className="match-percentage">
                                    <span>{Math.round(job.relevance_score || job.match_score || job.similarity_score)}%</span>
                                    <p>Match</p>
                                </div>
                            )}
                        </div>

                        <div className="job-details">
                            <div className="detail-row">
                                <div className="detail-label">Location</div>
                                <div className="detail-value">
                                    <FiMapPin className="detail-icon" />
                                    <span>{job.location}</span>
                                </div>
                            </div>
                            {job.salary && (
                                <div className="detail-row">
                                    <div className="detail-label">Salary</div>
                                    <div className="detail-value">
                                        <FiDollarSign className="detail-icon" />
                                        <span>{job.salary}</span>
                                    </div>
                                </div>
                            )}
                            <div className="detail-row">
                                <div className="detail-label">Type</div>
                                <div className="detail-value">
                                    <FiBriefcase className="detail-icon" />
                                    <span>{job.job_type || job.type}</span>
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Level</div>
                                <div className="detail-value">
                                    <FiClock className="detail-icon" />
                                    <span>{job.experience_level || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="recommendation-actions">
                            <button
                                className="view-details-btn"
                                onClick={() => navigate(`/jobs/${job.id}`)}
                            >
                                View Details
                            </button>
                            <button
                                className="apply-btn"
                                onClick={() => navigate(`/jobs/${job.id}/apply`)}
                            >
                                Apply Now
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default JobRecommendations;
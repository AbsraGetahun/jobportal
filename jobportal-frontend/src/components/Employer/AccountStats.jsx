import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiUsers, FiCheckCircle, FiTrendingUp, FiEye, FiStar } from 'react-icons/fi';

const AccountStats = ({ jobs, applicants }) => {
    const [stats, setStats] = useState({
        totalJobs: 0,
        totalApplications: 0,
        approvedJobs: 0,
        pendingJobs: 0,
        rejectedJobs: 0,
        successfulHires: 0,
        profileViews: 0,
        averageRating: 0
    });

    useEffect(() => {
        if (jobs && applicants) {
            const totalJobs = jobs.length;
            const approvedJobs = jobs.filter(job => job.status === 'approved').length;
            const pendingJobs = jobs.filter(job => job.status === 'pending').length;
            const rejectedJobs = jobs.filter(job => job.status === 'rejected').length;
            const totalApplications = applicants.length;
            const successfulHires = applicants.filter(app => app.status === 'accepted').length;

            setStats({
                totalJobs,
                totalApplications,
                approvedJobs,
                pendingJobs,
                rejectedJobs,
                successfulHires,
                profileViews: Math.floor(Math.random() * 1000) + 500, // Mock data
                averageRating: (Math.random() * 2 + 3).toFixed(1) // Mock data between 3.0-5.0
            });
        }
    }, [jobs, applicants]);

    return (
        <div className="account-stats">
            <h3>Employer Statistics</h3>
            <p className="stats-subtitle">
                Track your job postings performance and hiring success
            </p>

            <div className="stats-grid">
                <motion.div
                    className="stat-card"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="stat-icon total">
                        <FiBriefcase />
                    </div>
                    <div className="stat-info">
                        <h4>{stats.totalJobs}</h4>
                        <p>Total Jobs Posted</p>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="stat-icon applications">
                        <FiUsers />
                    </div>
                    <div className="stat-info">
                        <h4>{stats.totalApplications}</h4>
                        <p>Total Applications</p>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="stat-icon approved">
                        <FiCheckCircle />
                    </div>
                    <div className="stat-info">
                        <h4>{stats.approvedJobs}</h4>
                        <p>Approved Jobs</p>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="stat-icon hires">
                        <FiCheckCircle />
                    </div>
                    <div className="stat-info">
                        <h4>{stats.successfulHires}</h4>
                        <p>Successful Hires</p>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="stat-icon views">
                        <FiEye />
                    </div>
                    <div className="stat-info">
                        <h4>{stats.profileViews}</h4>
                        <p>Profile Views</p>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="stat-icon rating">
                        <FiStar />
                    </div>
                    <div className="stat-info">
                        <h4>{stats.averageRating}</h4>
                        <p>Average Rating</p>
                    </div>
                </motion.div>
            </div>

            <div className="job-performance-overview">
                <h4>Job Performance Overview</h4>
                <div className="performance-bars">
                    <div className="performance-bar">
                        <div
                            className="bar approved-bar"
                            style={{
                                width: `${(stats.approvedJobs / (stats.totalJobs || 1)) * 100}%`,
                                backgroundColor: '#10b981'
                            }}
                        ></div>
                        <span>Approved Jobs</span>
                        <span className="percentage">{Math.round((stats.approvedJobs / (stats.totalJobs || 1)) * 100)}%</span>
                    </div>
                    <div className="performance-bar">
                        <div
                            className="bar pending-bar"
                            style={{
                                width: `${(stats.pendingJobs / (stats.totalJobs || 1)) * 100}%`,
                                backgroundColor: '#3b82f6'
                            }}
                        ></div>
                        <span>Pending Jobs</span>
                        <span className="percentage">{Math.round((stats.pendingJobs / (stats.totalJobs || 1)) * 100)}%</span>
                    </div>
                    <div className="performance-bar">
                        <div
                            className="bar rejected-bar"
                            style={{
                                width: `${(stats.rejectedJobs / (stats.totalJobs || 1)) * 100}%`,
                                backgroundColor: '#ef4444'
                            }}
                        ></div>
                        <span>Rejected Jobs</span>
                        <span className="percentage">{Math.round((stats.rejectedJobs / (stats.totalJobs || 1)) * 100)}%</span>
                    </div>
                </div>
            </div>

            <div className="hiring-efficiency">
                <h4>Hiring Efficiency</h4>
                <div className="efficiency-metrics">
                    <div className="metric">
                        <span className="metric-label">Application-to-Hire Ratio</span>
                        <span className="metric-value">
                            {stats.totalApplications > 0
                                ? ((stats.successfulHires / stats.totalApplications) * 100).toFixed(1)
                                : 0}%
                        </span>
                    </div>
                    <div className="metric">
                        <span className="metric-label">Average Applications per Job</span>
                        <span className="metric-value">
                            {stats.totalJobs > 0
                                ? (stats.totalApplications / stats.totalJobs).toFixed(1)
                                : 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountStats;
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiCheckCircle, FiClock, FiXCircle, FiUser, FiTrendingUp } from 'react-icons/fi';

const AccountStats = ({ applications }) => {
    const [stats, setStats] = useState({
        totalApplications: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        rejectedApplications: 0,
        profileCompletion: 0
    });

    useEffect(() => {
        if (applications) {
            const total = applications.length;
            const pending = applications.filter(app => app.status === 'pending').length;
            const approved = applications.filter(app => app.status === 'approved').length;
            const rejected = applications.filter(app => app.status === 'rejected').length;
            
            setStats({
                totalApplications: total,
                pendingApplications: pending,
                approvedApplications: approved,
                rejectedApplications: rejected,
                profileCompletion: calculateProfileCompletion()
            });
        }
    }, [applications]);

    const calculateProfileCompletion = () => {
        // This is a simplified calculation - in a real app, this would check actual profile fields
        return 75; // For now, we'll return a fixed value
    };

    const statusColors = {
        pending: '#3b82f6',
        approved: '#10b981',
        rejected: '#ef4444',
        interview_scheduled: '#8b5cf6'
    };

    return (
        <div className="account-stats">
            <h3>Account Statistics</h3>
            <p className="stats-subtitle">
                Track your job application progress and profile completeness
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
                        <h4>{stats.totalApplications}</h4>
                        <p>Total Applications</p>
                    </div>
                </motion.div>
                
                <motion.div 
                    className="stat-card"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="stat-icon pending">
                        <FiClock />
                    </div>
                    <div className="stat-info">
                        <h4>{stats.pendingApplications}</h4>
                        <p>Pending</p>
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
                        <h4>{stats.approvedApplications}</h4>
                        <p>Approved</p>
                    </div>
                </motion.div>
                
                <motion.div 
                    className="stat-card"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="stat-icon rejected">
                        <FiXCircle />
                    </div>
                    <div className="stat-info">
                        <h4>{stats.rejectedApplications}</h4>
                        <p>Rejected</p>
                    </div>
                </motion.div>
                
                <motion.div 
                    className="stat-card"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="stat-icon profile">
                        <FiUser />
                    </div>
                    <div className="stat-info">
                        <h4>{stats.profileCompletion}%</h4>
                        <p>Profile Complete</p>
                    </div>
                </motion.div>
                
                <motion.div 
                    className="stat-card"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="stat-icon trending">
                        <FiTrendingUp />
                    </div>
                    <div className="stat-info">
                        <h4>8.5/10</h4>
                        <p>Match Score</p>
                    </div>
                </motion.div>
            </div>
            
            <div className="application-trend">
                <h4>Application Status Overview</h4>
                <div className="trend-bars">
                    <div className="trend-bar">
                        <div 
                            className="bar pending-bar" 
                            style={{ 
                                height: `${(stats.pendingApplications / (stats.totalApplications || 1)) * 100}%`,
                                backgroundColor: statusColors.pending
                            }}
                        ></div>
                        <span>Pending</span>
                    </div>
                    <div className="trend-bar">
                        <div 
                            className="bar approved-bar" 
                            style={{ 
                                height: `${(stats.approvedApplications / (stats.totalApplications || 1)) * 100}%`,
                                backgroundColor: statusColors.approved
                            }}
                        ></div>
                        <span>Approved</span>
                    </div>
                    <div className="trend-bar">
                        <div 
                            className="bar rejected-bar" 
                            style={{ 
                                height: `${(stats.rejectedApplications / (stats.totalApplications || 1)) * 100}%`,
                                backgroundColor: statusColors.rejected
                            }}
                        ></div>
                        <span>Rejected</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountStats;
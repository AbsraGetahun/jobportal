import '../../styles/components/JobSeeker/ActivityHistory.css';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiBriefcase, FiUser, FiFile, FiSettings, FiLogIn, FiLogOut } from 'react-icons/fi';

const ActivityHistory = ({ activities }) => {
    const [filter, setFilter] = useState('all');
    
    // Mock activity data
    const mockActivities = [
        {
            id: 1,
            type: 'application',
            title: 'Applied for Frontend Developer Position',
            description: 'Submitted application for Frontend Developer at TechCorp Inc.',
            timestamp: '2023-06-15T10:30:00Z',
            icon: <FiBriefcase />
        },
        {
            id: 2,
            type: 'profile',
            title: 'Updated Profile',
            description: 'Updated contact information and skills',
            timestamp: '2023-06-14T14:22:00Z',
            icon: <FiUser />
        },
        {
            id: 3,
            type: 'resume',
            title: 'Uploaded New Resume',
            description: 'Uploaded updated resume with recent experience',
            timestamp: '2023-06-12T09:15:00Z',
            icon: <FiFile />
        },
        {
            id: 4,
            type: 'login',
            title: 'Logged In',
            description: 'Successful login from IP address 192.168.1.100',
            timestamp: '2023-06-10T08:45:00Z',
            icon: <FiLogIn />
        },
        {
            id: 5,
            type: 'settings',
            title: 'Updated Notification Settings',
            description: 'Changed email notification preferences',
            timestamp: '2023-06-08T16:30:00Z',
            icon: <FiSettings />
        }
    ];

    const filteredActivities = filter === 'all' 
        ? mockActivities 
        : mockActivities.filter(activity => activity.type === filter);

    const getActivityTypeLabel = (type) => {
        const labels = {
            application: 'Application',
            profile: 'Profile',
            resume: 'Resume',
            settings: 'Settings',
            login: 'Login',
            logout: 'Logout'
        };
        return labels[type] || type;
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    return (
        <div className="activity-history">
            <div className="activity-header">
                <h3>Activity History</h3>
                <div className="activity-filters">
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Activities</option>
                        <option value="application">Applications</option>
                        <option value="profile">Profile</option>
                        <option value="resume">Resume</option>
                        <option value="settings">Settings</option>
                        <option value="login">Login/Logout</option>
                    </select>
                </div>
            </div>
            
            <p className="activity-subtitle">
                Track your account activity and important events
            </p>
            
            <div className="activity-list">
                {filteredActivities.length > 0 ? (
                    filteredActivities.map((activity) => (
                        <motion.div
                            key={activity.id}
                            className="activity-item"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="activity-icon">
                                {activity.icon}
                            </div>
                            <div className="activity-content">
                                <div className="activity-header-info">
                                    <h4>{activity.title}</h4>
                                    <span className={`activity-type ${activity.type}`}>
                                        {getActivityTypeLabel(activity.type)}
                                    </span>
                                </div>
                                <p className="activity-description">{activity.description}</p>
                                <p className="activity-timestamp">
                                    {formatTimestamp(activity.timestamp)}
                                </p>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <p className="no-activities">No activities found for the selected filter</p>
                )}
            </div>
        </div>
    );
};

export default ActivityHistory;
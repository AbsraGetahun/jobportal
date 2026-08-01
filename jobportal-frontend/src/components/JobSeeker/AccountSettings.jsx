import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSettings,
    FiShield,
    FiUserCheck,
    FiMail,
    FiShare2,
    FiActivity,
    FiDownload,
    FiLock,
    FiAlertTriangle
} from 'react-icons/fi';

// Import existing components
import SecurityForm from './SecurityForm';
import AccountVerification from './AccountVerification';
import ContactInfo from './ContactInfo';
import SocialMediaLinks from './SocialMediaLinks';
import ActivityHistory from './ActivityHistory';
import DownloadProfileData from './DownloadProfileData';
import PrivacySettings from './PrivacySettings';

// Import styles
import '../../../styles/components/JobSeeker/AccountSettings.css';

const AccountSettings = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [userContact, setUserContact] = useState({
        email: 'samri1@gmail.com',
        phone: '',
        address: '',
        website: ''
    });

    const tabs = [
        {
            id: 'overview',
            label: 'Overview',
            icon: <FiSettings />,
            description: 'Account overview and quick actions'
        },
        {
            id: 'security',
            label: 'Security',
            icon: <FiShield />,
            description: 'Password and account security'
        },
        {
            id: 'verification',
            label: 'Verification',
            icon: <FiUserCheck />,
            description: 'Account verification and trust'
        },
        {
            id: 'contact',
            label: 'Contact Info',
            icon: <FiMail />,
            description: 'Manage contact information'
        },
        {
            id: 'social',
            label: 'Social Media',
            icon: <FiShare2 />,
            description: 'Connect social profiles'
        },
        {
            id: 'privacy',
            label: 'Privacy',
            icon: <FiLock />,
            description: 'Privacy and visibility settings'
        },
        {
            id: 'activity',
            label: 'Activity',
            icon: <FiActivity />,
            description: 'Account activity history'
        },
        {
            id: 'data',
            label: 'Data & Export',
            icon: <FiDownload />,
            description: 'Download your data'
        }
    ];

    const handleContactUpdate = (updatedContact) => {
        setUserContact(updatedContact);
        // In a real app, this would make an API call
        console.log('Contact updated:', updatedContact);
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete all your data.')) {
            // In a real app, this would make an API call
            console.log('Account deletion initiated');
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <AccountOverview userContact={userContact} />;
            case 'security':
                return <SecurityForm onDeleteAccount={handleDeleteAccount} />;
            case 'verification':
                return <AccountVerification />;
            case 'contact':
                return <ContactInfo contact={userContact} onUpdate={handleContactUpdate} />;
            case 'social':
                return <SocialMediaLinks />;
            case 'privacy':
                return <PrivacySettings />;
            case 'activity':
                return <ActivityHistory />;
            case 'data':
                return <DownloadProfileData />;
            default:
                return <AccountOverview userContact={userContact} />;
        }
    };

    return (
        <div className="account-settings">
            <div className="settings-header">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1>Account Settings</h1>
                    <p className="settings-subtitle">
                        Manage your account preferences, security, and personal information
                    </p>
                </motion.div>
            </div>

            <div className="settings-container">
                {/* Sidebar Navigation */}
                <motion.div
                    className="settings-sidebar"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <nav className="settings-nav">
                        {tabs.map((tab, index) => (
                            <motion.button
                                key={tab.id}
                                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <div className="nav-icon">
                                    {tab.icon}
                                </div>
                                <div className="nav-content">
                                    <span className="nav-label">{tab.label}</span>
                                    <span className="nav-description">{tab.description}</span>
                                </div>
                                {activeTab === tab.id && (
                                    <motion.div
                                        className="active-indicator"
                                        layoutId="activeTab"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </motion.button>
                        ))}
                    </nav>
                </motion.div>

                {/* Main Content Area */}
                <motion.div
                    className="settings-content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="tab-content"
                        >
                            {renderTabContent()}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

// Account Overview Component
const AccountOverview = ({ userContact }) => {
    const quickStats = [
        { label: 'Profile Completion', value: '85%', color: '#10b981' },
        { label: 'Applications Sent', value: '12', color: '#3b82f6' },
        { label: 'Profile Views', value: '47', color: '#f59e0b' },
        { label: 'Response Rate', value: '68%', color: '#ef4444' }
    ];

    const recentActivities = [
        { action: 'Updated profile information', time: '2 hours ago' },
        { action: 'Applied to Senior Developer position', time: '1 day ago' },
        { action: 'Received message from TechCorp Inc.', time: '2 days ago' },
        { action: 'Profile verified successfully', time: '1 week ago' }
    ];

    return (
        <div className="account-overview">
            <div className="overview-header">
                <h2>Account Overview</h2>
                <p>Welcome back! Here's a quick summary of your account status.</p>
            </div>

            {/* Quick Stats */}
            <div className="quick-stats">
                <h3>Quick Stats</h3>
                <div className="stats-grid">
                    {quickStats.map((stat, index) => (
                        <motion.div
                            key={index}
                            className="stat-card"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="stat-value" style={{ color: stat.color }}>
                                {stat.value}
                            </div>
                            <div className="stat-label">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                    {recentActivities.map((activity, index) => (
                        <motion.div
                            key={index}
                            className="activity-item"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <div className="activity-dot"></div>
                            <div className="activity-content">
                                <p>{activity.action}</p>
                                <span>{activity.time}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                    <motion.button
                        className="action-btn primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => document.querySelector('[data-tab="verification"]')?.click()}
                    >
                        <FiUserCheck />
                        Complete Verification
                    </motion.button>
                    <motion.button
                        className="action-btn secondary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => document.querySelector('[data-tab="contact"]')?.click()}
                    >
                        <FiMail />
                        Update Contact Info
                    </motion.button>
                    <motion.button
                        className="action-btn tertiary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => document.querySelector('[data-tab="data"]')?.click()}
                    >
                        <FiDownload />
                        Download Data
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
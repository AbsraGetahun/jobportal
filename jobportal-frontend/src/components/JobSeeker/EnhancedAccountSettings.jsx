import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
    FiSettings,
    FiShield,
    FiUserCheck,
    FiMail,
    FiShare2,
    FiActivity,
    FiDownload,
    FiLock,
    FiAlertTriangle,
    FiTrendingUp,
    FiUsers,
    FiStar,
    FiZap,
    FiCheckCircle,
    FiXCircle,
    FiLoader,
    FiRefreshCw
} from 'react-icons/fi';

// Lazy load components for better performance
const SecurityForm = lazy(() => import('./SecurityForm'));
const AccountVerification = lazy(() => import('./AccountVerification'));
const ContactInfo = lazy(() => import('./ContactInfo'));
const SocialMediaLinks = lazy(() => import('./SocialMediaLinks'));
const ActivityHistory = lazy(() => import('./ActivityHistory'));
const DownloadProfileData = lazy(() => import('./DownloadProfileData'));
const PrivacySettings = lazy(() => import('./PrivacySettings'));

// Enhanced loading component
const ComponentLoader = ({ message = "Loading..." }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="component-loader"
    >
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="loader-icon"
        >
            <FiLoader />
        </motion.div>
        <p>{message}</p>
    </motion.div>
);

// Enhanced error boundary
class ComponentErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Component error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="component-error"
                >
                    <FiXCircle className="error-icon" />
                    <h3>Something went wrong</h3>
                    <p>We encountered an error loading this section.</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="retry-btn"
                    >
                        <FiRefreshCw /> Try Again
                    </motion.button>
                </motion.div>
            );
        }

        return this.props.children;
    }
}

const EnhancedAccountSettings = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [userContact, setUserContact] = useState({
        email: 'samri1@gmail.com',
        phone: '',
        address: '',
        website: ''
    });
    const [loadingStates, setLoadingStates] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [systemHealth, setSystemHealth] = useState({
        apiStatus: 'healthy',
        lastSync: new Date(),
        pendingActions: 0
    });

    // Enhanced tabs with metrics and health indicators
    const tabs = useMemo(() => [
        {
            id: 'overview',
            label: 'Overview',
            icon: <FiSettings />,
            description: 'Account overview and quick actions',
            badge: null,
            health: 'healthy'
        },
        {
            id: 'security',
            label: 'Security',
            icon: <FiShield />,
            description: 'Password and account security',
            badge: '1',
            health: 'warning'
        },
        {
            id: 'verification',
            label: 'Verification',
            icon: <FiUserCheck />,
            description: 'Account verification and trust',
            badge: 'pending',
            health: 'pending'
        },
        {
            id: 'contact',
            label: 'Contact Info',
            icon: <FiMail />,
            description: 'Manage contact information',
            badge: null,
            health: 'healthy'
        },
        {
            id: 'social',
            label: 'Social Media',
            icon: <FiShare2 />,
            description: 'Connect social profiles',
            badge: null,
            health: 'healthy'
        },
        {
            id: 'privacy',
            label: 'Privacy',
            icon: <FiLock />,
            description: 'Privacy and visibility settings',
            badge: null,
            health: 'healthy'
        },
        {
            id: 'activity',
            label: 'Activity',
            icon: <FiActivity />,
            description: 'Account activity history',
            badge: '3',
            health: 'healthy'
        },
        {
            id: 'data',
            label: 'Data & Export',
            icon: <FiDownload />,
            description: 'Download your data',
            badge: null,
            health: 'healthy'
        }
    ], []);

    // Memoized health status indicator
    const getHealthIndicator = useCallback((health) => {
        switch (health) {
            case 'healthy':
                return <FiCheckCircle className="health-healthy" />;
            case 'warning':
                return <FiAlertTriangle className="health-warning" />;
            case 'error':
                return <FiXCircle className="health-error" />;
            case 'pending':
                return <FiLoader className="health-pending" />;
            default:
                return null;
        }
    }, []);

    // Enhanced contact update with optimistic updates
    const handleContactUpdate = useCallback(async (updatedContact) => {
        const previousContact = { ...userContact };

        // Optimistic update
        setUserContact(updatedContact);
        setLoadingStates(prev => ({ ...prev, contact: true }));

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('Contact updated:', updatedContact);

            // Show success notification
            setNotifications(prev => [...prev, {
                id: Date.now(),
                type: 'success',
                message: 'Contact information updated successfully',
                timestamp: new Date()
            }]);
        } catch (error) {
            // Revert on error
            setUserContact(previousContact);
            setNotifications(prev => [...prev, {
                id: Date.now(),
                type: 'error',
                message: 'Failed to update contact information',
                timestamp: new Date()
            }]);
        } finally {
            setLoadingStates(prev => ({ ...prev, contact: false }));
        }
    }, [userContact]);

    // Enhanced delete account with confirmation flow
    const handleDeleteAccount = useCallback(async () => {
        const confirmations = [
            'Are you absolutely sure you want to delete your account?',
            'This action cannot be undone and will permanently delete all your data.',
            'Please type "DELETE" to confirm:'
        ];

        for (const confirmation of confirmations) {
            if (confirmation.includes('type "DELETE"')) {
                const userInput = prompt(confirmation);
                if (userInput !== 'DELETE') {
                    return;
                }
            } else if (!window.confirm(confirmation)) {
                return;
            }
        }

        setLoadingStates(prev => ({ ...prev, deleteAccount: true }));

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('Account deletion initiated');

            setNotifications(prev => [...prev, {
                id: Date.now(),
                type: 'success',
                message: 'Account deletion initiated. You will receive a confirmation email.',
                timestamp: new Date()
            }]);
        } catch (error) {
            setNotifications(prev => [...prev, {
                id: Date.now(),
                type: 'error',
                message: 'Failed to initiate account deletion',
                timestamp: new Date()
            }]);
        } finally {
            setLoadingStates(prev => ({ ...prev, deleteAccount: false }));
        }
    }, []);

    // Memoized tab content renderer
    const renderTabContent = useMemo(() => {
        const tabComponents = {
            overview: () => <EnhancedAccountOverview
                userContact={userContact}
                systemHealth={systemHealth}
                notifications={notifications}
            />,
            security: () => (
                <ComponentErrorBoundary>
                    <Suspense fallback={<ComponentLoader message="Loading security settings..." />}>
                        <SecurityForm onDeleteAccount={handleDeleteAccount} />
                    </Suspense>
                </ComponentErrorBoundary>
            ),
            verification: () => (
                <ComponentErrorBoundary>
                    <Suspense fallback={<ComponentLoader message="Loading verification..." />}>
                        <AccountVerification />
                    </Suspense>
                </ComponentErrorBoundary>
            ),
            contact: () => (
                <ComponentErrorBoundary>
                    <Suspense fallback={<ComponentLoader message="Loading contact info..." />}>
                        <ContactInfo
                            contact={userContact}
                            onUpdate={handleContactUpdate}
                            isLoading={loadingStates.contact}
                        />
                    </Suspense>
                </ComponentErrorBoundary>
            ),
            social: () => (
                <ComponentErrorBoundary>
                    <Suspense fallback={<ComponentLoader message="Loading social links..." />}>
                        <SocialMediaLinks />
                    </Suspense>
                </ComponentErrorBoundary>
            ),
            privacy: () => (
                <ComponentErrorBoundary>
                    <Suspense fallback={<ComponentLoader message="Loading privacy settings..." />}>
                        <PrivacySettings />
                    </Suspense>
                </ComponentErrorBoundary>
            ),
            activity: () => (
                <ComponentErrorBoundary>
                    <Suspense fallback={<ComponentLoader message="Loading activity history..." />}>
                        <ActivityHistory />
                    </Suspense>
                </ComponentErrorBoundary>
            ),
            data: () => (
                <ComponentErrorBoundary>
                    <Suspense fallback={<ComponentLoader message="Loading data export..." />}>
                        <DownloadProfileData />
                    </Suspense>
                </ComponentErrorBoundary>
            )
        };

        return tabComponents[activeTab] || tabComponents.overview;
    }, [activeTab, userContact, systemHealth, notifications, handleContactUpdate, handleDeleteAccount, loadingStates.contact]);

    // Auto-dismiss notifications
    useEffect(() => {
        const interval = setInterval(() => {
            setNotifications(prev => prev.slice(1));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="enhanced-account-settings">
            {/* Global Notifications */}
            <AnimatePresence>
                {notifications.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="global-notifications"
                    >
                        {notifications.map(notification => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                className={`notification ${notification.type}`}
                            >
                                <div className="notification-content">
                                    <span className="notification-message">
                                        {notification.message}
                                    </span>
                                    <button
                                        onClick={() => setNotifications(prev =>
                                            prev.filter(n => n.id !== notification.id)
                                        )}
                                        className="notification-close"
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

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
                    <div className="system-status">
                        <span className="status-indicator">
                            {getHealthIndicator(systemHealth.apiStatus)}
                            System Status: {systemHealth.apiStatus}
                        </span>
                        <span className="last-sync">
                            Last sync: {systemHealth.lastSync.toLocaleTimeString()}
                        </span>
                    </div>
                </motion.div>
            </div>

            <div className="settings-container">
                {/* Enhanced Sidebar Navigation */}
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
                                    {getHealthIndicator(tab.health)}
                                </div>
                                <div className="nav-content">
                                    <div className="nav-header">
                                        <span className="nav-label">{tab.label}</span>
                                        {tab.badge && (
                                            <span className="nav-badge">{tab.badge}</span>
                                        )}
                                    </div>
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

                    {/* Quick Stats Sidebar */}
                    <div className="sidebar-stats">
                        <h4>Quick Stats</h4>
                        <div className="stats-list">
                            <div className="stat-item">
                                <FiTrendingUp className="stat-icon" />
                                <span>Profile: 85% Complete</span>
                            </div>
                            <div className="stat-item">
                                <FiUsers className="stat-icon" />
                                <span>12 Applications</span>
                            </div>
                            <div className="stat-item">
                                <FiStar className="stat-icon" />
                                <span>Premium Member</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Enhanced Main Content Area */}
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

// Enhanced Account Overview Component
const EnhancedAccountOverview = ({ userContact, systemHealth, notifications }) => {
    const quickStats = useMemo(() => [
        { label: 'Profile Completion', value: '85%', color: '#10b981', icon: <FiTrendingUp /> },
        { label: 'Applications Sent', value: '12', color: '#3b82f6', icon: <FiUsers /> },
        { label: 'Profile Views', value: '47', color: '#f59e0b', icon: <FiActivity /> },
        { label: 'Response Rate', value: '68%', color: '#ef4444', icon: <FiZap /> }
    ], []);

    const recentActivities = useMemo(() => [
        { action: 'Updated profile information', time: '2 hours ago', type: 'profile' },
        { action: 'Applied to Senior Developer position', time: '1 day ago', type: 'application' },
        { action: 'Received message from TechCorp Inc.', time: '2 days ago', type: 'message' },
        { action: 'Profile verified successfully', time: '1 week ago', type: 'verification' }
    ], []);

    const quickActions = useMemo(() => [
        {
            label: 'Complete Verification',
            icon: <FiUserCheck />,
            action: () => document.querySelector('[data-tab="verification"]')?.click(),
            variant: 'primary'
        },
        {
            label: 'Update Contact Info',
            icon: <FiMail />,
            action: () => document.querySelector('[data-tab="contact"]')?.click(),
            variant: 'secondary'
        },
        {
            label: 'Download Data',
            icon: <FiDownload />,
            action: () => document.querySelector('[data-tab="data"]')?.click(),
            variant: 'tertiary'
        }
    ], []);

    return (
        <div className="enhanced-account-overview">
            <div className="overview-header">
                <h2>Account Overview</h2>
                <p>Welcome back! Here's a quick summary of your account status.</p>
            </div>

            {/* Enhanced Quick Stats */}
            <div className="quick-stats">
                <h3>Quick Stats</h3>
                <div className="stats-grid">
                    {quickStats.map((stat, index) => (
                        <motion.div
                            key={index}
                            className="stat-card"
                            whileHover={{ scale: 1.05, y: -5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="stat-header">
                                <div className="stat-icon" style={{ color: stat.color }}>
                                    {stat.icon}
                                </div>
                                <div className="stat-value" style={{ color: stat.color }}>
                                    {stat.value}
                                </div>
                            </div>
                            <div className="stat-label">{stat.label}</div>
                            <motion.div
                                className="stat-progress"
                                initial={{ width: 0 }}
                                animate={{ width: stat.value }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Enhanced Recent Activity */}
            <div className="recent-activity">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                    {recentActivities.map((activity, index) => (
                        <motion.div
                            key={index}
                            className={`activity-item ${activity.type}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <div className="activity-dot"></div>
                            <div className="activity-content">
                                <p>{activity.action}</p>
                                <span>{activity.time}</span>
                            </div>
                            <div className="activity-type">
                                {activity.type === 'profile' && <FiUser />}
                                {activity.type === 'application' && <FiBriefcase />}
                                {activity.type === 'message' && <FiMail />}
                                {activity.type === 'verification' && <FiCheckCircle />}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="quick-actions">
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                    {quickActions.map((action, index) => (
                        <motion.button
                            key={index}
                            className={`action-btn ${action.variant}`}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={action.action}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <span className="action-icon">{action.icon}</span>
                            <span className="action-label">{action.label}</span>
                            <motion.div
                                className="action-glow"
                                whileHover={{ opacity: 0.3 }}
                            />
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* System Health & Notifications */}
            <div className="system-health">
                <h3>System Status</h3>
                <div className="health-grid">
                    <div className="health-item">
                        <FiCheckCircle className="health-icon healthy" />
                        <div>
                            <h4>API Status</h4>
                            <p>All systems operational</p>
                        </div>
                    </div>
                    <div className="health-item">
                        <FiShield className="health-icon secure" />
                        <div>
                            <h4>Security</h4>
                            <p>Account protected</p>
                        </div>
                    </div>
                    <div className="health-item">
                        <FiZap className="health-icon fast" />
                        <div>
                            <h4>Performance</h4>
                            <p>Optimal speed</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedAccountSettings;
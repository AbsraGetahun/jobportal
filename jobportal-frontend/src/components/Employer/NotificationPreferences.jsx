import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiMail, FiSmartphone, FiBriefcase, FiUsers, FiTrendingUp } from 'react-icons/fi';

const NotificationPreferences = () => {
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        jobApplications: true,
        jobApprovals: true,
        candidateUpdates: true,
        analyticsReports: false,
        systemUpdates: true
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleToggle = (key) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSavePreferences = async () => {
        setSaving(true);
        setMessage('');
        setMessageType('');

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setMessage('Notification preferences saved successfully!');
            setMessageType('success');
        } catch (error) {
            setMessage('Failed to save preferences. Please try again.');
            setMessageType('error');
        } finally {
            setSaving(false);
        }
    };

    const notificationOptions = [
        {
            key: 'jobApplications',
            title: "Job Applications",
            description: "Get notified when candidates apply to your jobs",
            icon: <FiUsers />
        },
        {
            key: 'jobApprovals',
            title: "Job Approvals",
            description: "Receive updates on job posting approvals",
            icon: <FiBriefcase />
        },
        {
            key: 'candidateUpdates',
            title: "Candidate Updates",
            description: "Notifications about candidate status changes",
            icon: <FiUsers />
        },
        {
            key: 'analyticsReports',
            title: "Analytics Reports",
            description: "Weekly analytics and performance reports",
            icon: <FiTrendingUp />
        },
        {
            key: 'systemUpdates',
            title: "System Updates",
            description: "Important platform updates and maintenance",
            icon: <FiBell />
        }
    ];

    return (
        <div className="notification-preferences">
            <h3>Notification Preferences</h3>
            <p className="preferences-subtitle">
                Choose how you want to be notified about applications and account activity
            </p>

            {message && (
                <div className={`message ${messageType}`}>
                    {message}
                </div>
            )}

            <div className="preferences-section">
                <h4>Notification Methods</h4>
                <div className="preference-group">
                    <div className="preference-item">
                        <div className="preference-info">
                            <FiMail className="preference-icon" />
                            <div>
                                <h5>Email Notifications</h5>
                                <p>Receive notifications via email</p>
                            </div>
                        </div>
                        <div className="toggle-switch">
                            <input
                                type="checkbox"
                                id="emailNotifications"
                                checked={preferences.emailNotifications}
                                onChange={() => handleToggle('emailNotifications')}
                            />
                            <label htmlFor="emailNotifications" className="switch">
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>

                    <div className="preference-item">
                        <div className="preference-info">
                            <FiSmartphone className="preference-icon" />
                            <div>
                                <h5>SMS Notifications</h5>
                                <p>Receive notifications via text message</p>
                            </div>
                        </div>
                        <div className="toggle-switch">
                            <input
                                type="checkbox"
                                id="smsNotifications"
                                checked={preferences.smsNotifications}
                                onChange={() => handleToggle('smsNotifications')}
                            />
                            <label htmlFor="smsNotifications" className="switch">
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>

                    <div className="preference-item">
                        <div className="preference-info">
                            <FiBell className="preference-icon" />
                            <div>
                                <h5>Push Notifications</h5>
                                <p>Receive notifications in your browser/app</p>
                            </div>
                        </div>
                        <div className="toggle-switch">
                            <input
                                type="checkbox"
                                id="pushNotifications"
                                checked={preferences.pushNotifications}
                                onChange={() => handleToggle('pushNotifications')}
                            />
                            <label htmlFor="pushNotifications" className="switch">
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="preferences-section">
                <h4>Notification Types</h4>
                <div className="preference-group">
                    {notificationOptions.map((option) => (
                        <div className="preference-item" key={option.key}>
                            <div className="preference-info">
                                <div className="preference-icon">
                                    {option.icon}
                                </div>
                                <div>
                                    <h5>{option.title}</h5>
                                    <p>{option.description}</p>
                                </div>
                            </div>
                            <div className="toggle-switch">
                                <input
                                    type="checkbox"
                                    id={option.key}
                                    checked={preferences[option.key]}
                                    onChange={() => handleToggle(option.key)}
                                />
                                <label htmlFor={option.key} className="switch">
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="preferences-actions">
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="save-btn"
                    onClick={handleSavePreferences}
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save Preferences'}
                </motion.button>
            </div>
        </div>
    );
};

export default NotificationPreferences;
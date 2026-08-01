import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiMail, FiSmartphone, FiBriefcase, FiUser, FiHeart } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { handleApiError } from '../../utils';
import '../../styles/components/JobSeeker/NotificationPreferences.css';

const NotificationPreferences = () => {
    const { api } = useAuth();
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        jobAlerts: true,
        applicationUpdates: true,
        companyNews: false,
        profileSuggestions: true,
        savedJobs: true
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    // Load preferences on component mount
    useEffect(() => {
        const loadPreferences = async () => {
            setLoading(true);
            try {
                const response = await api.get('/profile/notification-preferences');
                const data = response.data.data;
                setPreferences({
                    emailNotifications: data.email_notifications,
                    smsNotifications: data.sms_notifications,
                    pushNotifications: data.push_notifications,
                    jobAlerts: data.job_alerts,
                    applicationUpdates: data.application_updates,
                    companyNews: data.company_news,
                    profileSuggestions: data.profile_suggestions,
                    savedJobs: data.saved_jobs_notifications
                });
            } catch (error) {
                const errorInfo = handleApiError(error);
                setMessage(errorInfo.message);
                setMessageType('error');
            } finally {
                setLoading(false);
            }
        };

        loadPreferences();
    }, [api]);

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
            const payload = {
                email_notifications: preferences.emailNotifications,
                sms_notifications: preferences.smsNotifications,
                push_notifications: preferences.pushNotifications,
                job_alerts: preferences.jobAlerts,
                application_updates: preferences.applicationUpdates,
                company_news: preferences.companyNews,
                profile_suggestions: preferences.profileSuggestions,
                saved_jobs_notifications: preferences.savedJobs
            };

            await api.put('/profile/notification-preferences', payload);

            setMessage('Notification preferences saved successfully!');
            setMessageType('success');
        } catch (error) {
            const errorInfo = handleApiError(error);
            setMessage(errorInfo.message);
            setMessageType('error');
        } finally {
            setSaving(false);
        }
    };

    const notificationOptions = [
        {
            key: 'jobAlerts',
            title: "Job Alerts",
            description: "Get notified about new jobs matching your preferences",
            icon: <FiBriefcase />
        },
        {
            key: 'applicationUpdates',
            title: "Application Updates",
            description: "Receive updates on your job applications",
            icon: <FiUser />
        },
        {
            key: 'savedJobs',
            title: "Saved Jobs",
            description: "Notifications about saved jobs",
            icon: <FiHeart />
        },
        {
            key: 'profileSuggestions',
            title: "Profile Suggestions",
            description: "Get suggestions to improve your profile",
            icon: <FiUser />
        }
    ];

    if (loading) {
        return (
            <div className="notification-preferences">
                <div className="loading-state">
                    <p>Loading your notification preferences...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="notification-preferences">
            <h3>Notification Preferences</h3>
            <p className="preferences-subtitle">
                Choose how you want to be notified about job opportunities and account activity
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
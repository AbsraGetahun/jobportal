import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiBriefcase, FiMail, FiMapPin } from 'react-icons/fi';

const PrivacySettings = () => {
    const [settings, setSettings] = useState({
        companyVisibility: 'public',
        showCompanyEmail: true,
        showCompanyPhone: false,
        showCompanyLocation: true,
        showCompanySize: true,
        showJobPostings: true,
        allowCandidateMessaging: true,
        allowProfileIndexing: true
    });

    const handleSelectChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleToggle = (key) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const visibilityOptions = [
        { value: 'public', label: 'Public - Visible to everyone' },
        { value: 'jobseekers', label: 'Job Seekers Only - Only job seekers can view' },
        { value: 'verified', label: 'Verified Users - Only verified users can view' },
        { value: 'private', label: 'Private - Only you can view' }
    ];

    const privacyOptions = [
        {
            key: 'showCompanyEmail',
            title: "Company Email Visibility",
            description: "Allow others to see your company email",
            icon: <FiMail />
        },
        {
            key: 'showCompanyPhone',
            title: "Company Phone Visibility",
            description: "Allow others to see your company phone",
            icon: <FiBriefcase />
        },
        {
            key: 'showCompanyLocation',
            title: "Company Location Visibility",
            description: "Show your company location",
            icon: <FiMapPin />
        },
        {
            key: 'showCompanySize',
            title: "Company Size Visibility",
            description: "Display your company size",
            icon: <FiBriefcase />
        },
        {
            key: 'showJobPostings',
            title: "Job Postings Visibility",
            description: "Show your active job postings",
            icon: <FiBriefcase />
        },
        {
            key: 'allowCandidateMessaging',
            title: "Allow Candidate Messaging",
            description: "Allow candidates to message you",
            icon: <FiMail />
        },
        {
            key: 'allowProfileIndexing',
            title: "Profile Search Indexing",
            description: "Allow your company profile to appear in search results",
            icon: <FiBriefcase />
        }
    ];

    return (
        <div className="privacy-settings">
            <h3>Privacy Settings</h3>
            <p className="privacy-subtitle">
                Control who can see your company profile and job postings
            </p>

            <div className="privacy-section">
                <h4>Company Profile Visibility</h4>
                <div className="select-container">
                    <select
                        value={settings.companyVisibility}
                        onChange={(e) => handleSelectChange('companyVisibility', e.target.value)}
                        className="privacy-select"
                    >
                        {visibilityOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <p className="visibility-description">
                    {visibilityOptions.find(opt => opt.value === settings.companyVisibility)?.label}
                </p>
            </div>

            <div className="privacy-section">
                <h4>Privacy Controls</h4>
                <div className="privacy-group">
                    {privacyOptions.map((option) => (
                        <div className="privacy-item" key={option.key}>
                            <div className="privacy-info">
                                <div className="privacy-icon">
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
                                    checked={settings[option.key]}
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

            <div className="privacy-notice">
                <div className="notice-icon">
                    <FiLock />
                </div>
                <div className="notice-content">
                    <h5>Data Protection</h5>
                    <p>Your privacy settings help protect your company's sensitive information while maintaining visibility to potential candidates.</p>
                </div>
            </div>

            <div className="privacy-actions">
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="save-btn"
                >
                    Save Privacy Settings
                </motion.button>
            </div>
        </div>
    );
};

export default PrivacySettings;
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff, FiUser, FiBriefcase, FiMail } from 'react-icons/fi';
import '../../styles/components/JobSeeker/PrivacySettings.css';

const PrivacySettings = () => {
    const [settings, setSettings] = useState({
        profileVisibility: 'public',
        showEmail: true,
        showPhone: false,
        showLocation: true,
        showExperience: true,
        showEducation: true,
        allowMessaging: true,
        allowProfileSearch: true
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
        { value: 'registered', label: 'Registered Users - Only logged-in users' },
        { value: 'employers', label: 'Employers Only - Only employers can view' },
        { value: 'private', label: 'Private - Only you can view' }
    ];

    const privacyOptions = [
        {
            key: 'showEmail',
            title: "Email Visibility",
            description: "Allow others to see your email address",
            icon: <FiMail />
        },
        {
            key: 'showPhone',
            title: "Phone Visibility",
            description: "Allow others to see your phone number",
            icon: <FiUser />
        },
        {
            key: 'showLocation',
            title: "Location Visibility",
            description: "Show your location on your profile",
            icon: <FiUser />
        },
        {
            key: 'showExperience',
            title: "Experience Visibility",
            description: "Display your work experience",
            icon: <FiBriefcase />
        },
        {
            key: 'showEducation',
            title: "Education Visibility",
            description: "Show your educational background",
            icon: <FiUser />
        },
        {
            key: 'allowMessaging',
            title: "Allow Messaging",
            description: "Allow other users to message you",
            icon: <FiMail />
        },
        {
            key: 'allowProfileSearch',
            title: "Profile Search",
            description: "Allow your profile to appear in search results",
            icon: <FiUser />
        }
    ];

    return (
        <div className="privacy-settings">
            <h3>Privacy Settings</h3>
            <p className="privacy-subtitle">
                Control who can see your profile and personal information
            </p>
            
            <div className="privacy-section">
                <h4>Profile Visibility</h4>
                <div className="select-container">
                    <select
                        value={settings.profileVisibility}
                        onChange={(e) => handleSelectChange('profileVisibility', e.target.value)}
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
                    {visibilityOptions.find(opt => opt.value === settings.profileVisibility)?.label}
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
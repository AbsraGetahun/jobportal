import '../../styles/components/JobSeeker/SocialMediaLinks.css';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiLinkedin, FiTwitter, FiGithub, FiGlobe, FiPlus, FiX } from 'react-icons/fi';

const SocialMediaLinks = () => {
    const [links, setLinks] = useState([
        { id: 1, platform: 'linkedin', url: 'https://linkedin.com/in/johndoe', icon: <FiLinkedin /> },
        { id: 2, platform: 'github', url: 'https://github.com/johndoe', icon: <FiGithub /> }
    ]);
    
    const [newLink, setNewLink] = useState({ platform: 'linkedin', url: '' });
    const [showAddForm, setShowAddForm] = useState(false);

    const handleAddLink = () => {
        if (newLink.url.trim() !== '') {
            const platformIcons = {
                linkedin: <FiLinkedin />,
                twitter: <FiTwitter />,
                github: <FiGithub />,
                website: <FiGlobe />
            };
            
            setLinks(prev => [
                ...prev,
                {
                    id: Date.now(),
                    platform: newLink.platform,
                    url: newLink.url,
                    icon: platformIcons[newLink.platform]
                }
            ]);
            
            setNewLink({ platform: 'linkedin', url: '' });
            setShowAddForm(false);
        }
    };

    const handleRemoveLink = (id) => {
        setLinks(prev => prev.filter(link => link.id !== id));
    };

    const platformOptions = [
        { value: 'linkedin', label: 'LinkedIn', icon: <FiLinkedin /> },
        { value: 'twitter', label: 'Twitter', icon: <FiTwitter /> },
        { value: 'github', label: 'GitHub', icon: <FiGithub /> },
        { value: 'website', label: 'Personal Website', icon: <FiGlobe /> }
    ];

    return (
        <div className="social-media-links">
            <div className="social-media-header">
                <h3>Social Media Links</h3>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="add-link-btn"
                    onClick={() => setShowAddForm(true)}
                >
                    <FiPlus /> Add Link
                </motion.button>
            </div>
            
            <p className="social-media-subtitle">
                Connect your social media profiles to enhance your professional presence
            </p>
            
            {links.length === 0 ? (
                <div className="empty-links">
                    <p>You haven't added any social media links yet</p>
                </div>
            ) : (
                <div className="links-list">
                    {links.map((link) => (
                        <motion.div
                            key={link.id}
                            className="link-item"
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="link-info">
                                <div className="link-icon">
                                    {link.icon}
                                </div>
                                <div className="link-details">
                                    <h4>{platformOptions.find(opt => opt.value === link.platform)?.label}</h4>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                                        {link.url}
                                    </a>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="remove-link-btn"
                                onClick={() => handleRemoveLink(link.id)}
                            >
                                <FiX />
                            </motion.button>
                        </motion.div>
                    ))}
                </div>
            )}
            
            {showAddForm && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="add-link-form"
                >
                    <h4>Add New Social Media Link</h4>
                    <div className="form-group">
                        <label>Platform</label>
                        <select
                            value={newLink.platform}
                            onChange={(e) => setNewLink(prev => ({ ...prev, platform: e.target.value }))}
                            className="platform-select"
                        >
                            {platformOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>URL</label>
                        <input
                            type="url"
                            value={newLink.url}
                            onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                            placeholder="https://example.com/your-profile"
                            className="url-input"
                        />
                    </div>
                    
                    <div className="form-actions">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="cancel-btn"
                            onClick={() => setShowAddForm(false)}
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="save-btn"
                            onClick={handleAddLink}
                        >
                            Add Link
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default SocialMediaLinks;
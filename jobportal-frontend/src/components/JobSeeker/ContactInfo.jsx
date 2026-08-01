import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiGlobe, FiEdit, FiSave, FiX } from 'react-icons/fi';

const ContactInfo = ({ contact, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        email: contact?.email || '',
        phone: contact?.phone || '',
        location: contact?.location || contact?.address || '',
        website: contact?.website || ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        onUpdate(formData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({
            email: contact?.email || '',
            phone: contact?.phone || '',
            address: contact?.address || '',
            website: contact?.website || ''
        });
        setIsEditing(false);
    };

    return (
        <div className="contact-info">
            <div className="contact-header">
                <h3>Contact Information</h3>
                {!isEditing && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="edit-contact-btn"
                        onClick={() => setIsEditing(true)}
                    >
                        <FiEdit /> Edit
                    </motion.button>
                )}
            </div>
            
            <p className="contact-subtitle">
                Manage how employers and recruiters can contact you
            </p>
            
            {isEditing ? (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="contact-form"
                >
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-with-icon">
                            <FiMail className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="contact-input"
                                placeholder="your.email@example.com"
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Phone Number</label>
                        <div className="input-with-icon">
                            <FiPhone className="input-icon" />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="contact-input"
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Address</label>
                        <div className="input-with-icon">
                            <FiMapPin className="input-icon" />
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="contact-input"
                                placeholder="City, Country"
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label>Website/Portfolio</label>
                        <div className="input-with-icon">
                            <FiGlobe className="input-icon" />
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleInputChange}
                                className="contact-input"
                                placeholder="https://yourportfolio.com"
                            />
                        </div>
                    </div>
                    
                    <div className="form-actions">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="cancel-btn"
                            onClick={handleCancel}
                        >
                            <FiX /> Cancel
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="save-btn"
                            onClick={handleSave}
                        >
                            <FiSave /> Save Changes
                        </motion.button>
                    </div>
                </motion.div>
            ) : (
                <div className="contact-details">
                    <div className="contact-item">
                        <FiMail className="contact-icon" />
                        <div>
                            <h4>Email</h4>
                            <p>{contact?.email || 'Not provided'}</p>
                        </div>
                    </div>
                    
                    <div className="contact-item">
                        <FiPhone className="contact-icon" />
                        <div>
                            <h4>Phone</h4>
                            <p>{contact?.phone || 'Not provided'}</p>
                        </div>
                    </div>
                    
                    <div className="contact-item">
                        <FiMapPin className="contact-icon" />
                        <div>
                            <h4>Address</h4>
                            <p>{contact?.address || 'Not provided'}</p>
                        </div>
                    </div>
                    
                    <div className="contact-item">
                        <FiGlobe className="contact-icon" />
                        <div>
                            <h4>Website</h4>
                            {contact?.website ? (
                                <a href={contact.website} target="_blank" rel="noopener noreferrer">
                                    {contact.website}
                                </a>
                            ) : (
                                <p>Not provided</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactInfo;
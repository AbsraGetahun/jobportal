import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiCalendar, FiEdit, FiSave, FiX, FiPlus } from 'react-icons/fi';

const EducationHistory = ({ education, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [educationData, setEducationData] = useState(education || []);
    const [newEducation, setNewEducation] = useState({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        description: ''
    });

    const handleAddEducation = () => {
        if (newEducation.institution.trim() !== '' && newEducation.degree.trim() !== '') {
            setEducationData(prev => [...prev, { ...newEducation, id: Date.now() }]);
            setNewEducation({
                institution: '',
                degree: '',
                fieldOfStudy: '',
                startDate: '',
                endDate: '',
                description: ''
            });
        }
    };

    const handleRemoveEducation = (id) => {
        setEducationData(prev => prev.filter(edu => edu.id !== id));
    };

    const handleSave = () => {
        onUpdate(educationData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEducationData(education || []);
        setIsEditing(false);
    };

    return (
        <div className="education-history">
            <div className="education-header">
                <div className="education-header-content">
                    <h3>Education History</h3>
                    {!isEditing && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="edit-education-btn"
                            onClick={() => setIsEditing(true)}
                        >
                            <FiEdit /> Edit
                        </motion.button>
                    )}
                </div>
                <p className="education-subtitle">
                    Showcase your educational background and qualifications
                </p>
            </div>
            
            {isEditing ? (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="education-edit-form"
                >
                    <div className="add-education-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Institution</label>
                                <input
                                    type="text"
                                    value={newEducation.institution}
                                    onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                                    placeholder="University or College name"
                                    className="education-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Degree</label>
                                <input
                                    type="text"
                                    value={newEducation.degree}
                                    onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                                    placeholder="e.g., Bachelor of Science"
                                    className="education-input"
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label>Field of Study</label>
                            <input
                                type="text"
                                value={newEducation.fieldOfStudy}
                                onChange={(e) => setNewEducation(prev => ({ ...prev, fieldOfStudy: e.target.value }))}
                                placeholder="e.g., Computer Science"
                                className="education-input"
                            />
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={newEducation.startDate}
                                    onChange={(e) => setNewEducation(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="date-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={newEducation.endDate}
                                    onChange={(e) => setNewEducation(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="date-input"
                                />
                            </div>
                        </div>
                        
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={newEducation.description}
                                onChange={(e) => setNewEducation(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe your studies, achievements, or relevant coursework"
                                className="description-input"
                                rows="3"
                            />
                        </div>
                        
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="add-education-btn"
                            onClick={handleAddEducation}
                        >
                            <FiPlus /> Add Education
                        </motion.button>
                    </div>
                    
                    <div className="education-list">
                        {educationData.map((edu) => (
                            <div key={edu.id} className="education-item">
                                <div className="education-header">
                                    <h5>{edu.degree}</h5>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="remove-education-btn"
                                        onClick={() => handleRemoveEducation(edu.id)}
                                    >
                                        <FiX />
                                    </motion.button>
                                </div>
                                <p className="institution">{edu.institution}</p>
                                <p className="field-of-study">{edu.fieldOfStudy}</p>
                                <p className="date-range">
                                    <FiCalendar className="calendar-icon" />
                                    {edu.startDate} - {edu.endDate || 'Present'}
                                </p>
                                <p className="description">{edu.description}</p>
                            </div>
                        ))}
                    </div>
                    
                    <div className="education-form-actions">
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
                <div className="education-display">
                    {educationData.length > 0 ? (
                        <div className="education-display-list">
                            {educationData.map((edu, index) => (
                                <div key={index} className="education-display-item">
                                    <div className="education-display-header">
                                        <h5>{edu.degree}</h5>
                                        <FiAward className="award-icon" />
                                    </div>
                                    <p className="institution">{edu.institution}</p>
                                    <p className="field-of-study">{edu.fieldOfStudy}</p>
                                    <p className="date-range">
                                        <FiCalendar className="calendar-icon" />
                                        {edu.startDate} - {edu.endDate || 'Present'}
                                    </p>
                                    <p className="description">{edu.description}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-education">No education history added yet</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default EducationHistory;
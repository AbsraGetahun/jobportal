import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBriefcase, FiAward, FiPlus, FiX, FiEdit, FiSave } from 'react-icons/fi';

const SkillsExperience = ({ skills, experience, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [skillsData, setSkillsData] = useState(skills || []);
    const [experienceData, setExperienceData] = useState(experience || []);
    const [newSkill, setNewSkill] = useState({ name: '', level: 'intermediate' });
    const [newExperience, setNewExperience] = useState({
        title: '',
        company: '',
        startDate: '',
        endDate: '',
        description: ''
    });

    const handleAddSkill = () => {
        if (newSkill.name.trim() !== '') {
            setSkillsData(prev => [...prev, { ...newSkill, id: Date.now() }]);
            setNewSkill({ name: '', level: 'intermediate' });
        }
    };

    const handleRemoveSkill = (id) => {
        setSkillsData(prev => prev.filter(skill => skill.id !== id));
    };

    const handleAddExperience = () => {
        if (newExperience.title.trim() !== '' && newExperience.company.trim() !== '') {
            setExperienceData(prev => [...prev, { ...newExperience, id: Date.now() }]);
            setNewExperience({
                title: '',
                company: '',
                startDate: '',
                endDate: '',
                description: ''
            });
        }
    };

    const handleRemoveExperience = (id) => {
        setExperienceData(prev => prev.filter(exp => exp.id !== id));
    };

    const handleSave = () => {
        onUpdate({ skills: skillsData, experience: experienceData });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setSkillsData(skills || []);
        setExperienceData(experience || []);
        setIsEditing(false);
    };

    const levelOptions = [
        { value: 'beginner', label: 'Beginner' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' },
        { value: 'expert', label: 'Expert' }
    ];

    return (
        <div className="skills-experience">
            <div className="skills-header">
                <div className="skills-header-content">
                    <h3>Skills & Work Experience</h3>
                    {!isEditing && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="edit-skills-btn"
                            onClick={() => setIsEditing(true)}
                        >
                            <FiEdit /> Edit
                        </motion.button>
                    )}
                </div>
                <p className="skills-subtitle">
                    Showcase your professional skills and work experience
                </p>
            </div>
            
            {isEditing ? (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="skills-edit-form"
                >
                    {/* Skills Section */}
                    <div className="skills-section">
                        <h4>Skills</h4>
                        <div className="add-skill-form">
                            <input
                                type="text"
                                value={newSkill.name}
                                onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Skill name"
                                className="skill-input"
                            />
                            <select
                                value={newSkill.level}
                                onChange={(e) => setNewSkill(prev => ({ ...prev, level: e.target.value }))}
                                className="level-select"
                            >
                                {levelOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="add-skill-btn"
                                onClick={handleAddSkill}
                            >
                                <FiPlus />
                            </motion.button>
                        </div>
                        
                        <div className="skills-list">
                            {skillsData.map((skill) => (
                                <div key={skill.id} className="skill-item">
                                    <span className="skill-name">{skill.name}</span>
                                    <span className="skill-level">{skill.level}</span>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="remove-skill-btn"
                                        onClick={() => handleRemoveSkill(skill.id)}
                                    >
                                        <FiX />
                                    </motion.button>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Experience Section */}
                    <div className="experience-section">
                        <h4>Work Experience</h4>
                        <div className="add-experience-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Job Title</label>
                                    <input
                                        type="text"
                                        value={newExperience.title}
                                        onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="e.g., Software Engineer"
                                        className="experience-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Company</label>
                                    <input
                                        type="text"
                                        value={newExperience.company}
                                        onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                                        placeholder="Company name"
                                        className="experience-input"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={newExperience.startDate}
                                        onChange={(e) => setNewExperience(prev => ({ ...prev, startDate: e.target.value }))}
                                        className="date-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={newExperience.endDate}
                                        onChange={(e) => setNewExperience(prev => ({ ...prev, endDate: e.target.value }))}
                                        className="date-input"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={newExperience.description}
                                    onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Describe your responsibilities and achievements"
                                    className="description-input"
                                    rows="3"
                                />
                            </div>
                            
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                className="add-experience-btn"
                                onClick={handleAddExperience}
                            >
                                <FiPlus /> Add Experience
                            </motion.button>
                        </div>
                        
                        <div className="experience-list">
                            {experienceData.map((exp) => (
                                <div key={exp.id} className="experience-item">
                                    <div className="experience-header">
                                        <h5>{exp.title}</h5>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="remove-experience-btn"
                                            onClick={() => handleRemoveExperience(exp.id)}
                                        >
                                            <FiX />
                                        </motion.button>
                                    </div>
                                    <p className="company">{exp.company}</p>
                                    <p className="date-range">
                                        {exp.startDate} - {exp.endDate || 'Present'}
                                    </p>
                                    <p className="description">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="skills-form-actions">
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
                <div className="skills-display">
                    {/* Skills Display */}
                    <div className="skills-display-section">
                        <h4>Skills</h4>
                        {skillsData.length > 0 ? (
                            <div className="skills-display-list">
                                {skillsData.map((skill, index) => (
                                    <div key={index} className="skill-display-item">
                                        <span className="skill-display-name">{skill.name}</span>
                                        <span className="skill-display-level">{skill.level}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-skills">No skills added yet</p>
                        )}
                    </div>
                    
                    {/* Experience Display */}
                    <div className="experience-display-section">
                        <h4>Work Experience</h4>
                        {experienceData.length > 0 ? (
                            <div className="experience-display-list">
                                {experienceData.map((exp, index) => (
                                    <div key={index} className="experience-display-item">
                                        <h5>{exp.title}</h5>
                                        <p className="company">{exp.company}</p>
                                        <p className="date-range">
                                            {exp.startDate} - {exp.endDate || 'Present'}
                                        </p>
                                        <p className="description">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-experience">No work experience added yet</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillsExperience;
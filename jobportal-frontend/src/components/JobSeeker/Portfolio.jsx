import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiFolder, FiLink, FiEdit, FiSave, FiX, FiPlus, FiImage } from 'react-icons/fi';

const Portfolio = ({ projects, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [projectsData, setProjectsData] = useState(projects || []);
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        url: '',
        technologies: ''
    });

    const handleAddProject = () => {
        if (newProject.title.trim() !== '') {
            setProjectsData(prev => [...prev, { ...newProject, id: Date.now() }]);
            setNewProject({
                title: '',
                description: '',
                url: '',
                technologies: ''
            });
        }
    };

    const handleRemoveProject = (id) => {
        setProjectsData(prev => prev.filter(project => project.id !== id));
    };

    const handleSave = () => {
        onUpdate(projectsData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setProjectsData(projects || []);
        setIsEditing(false);
    };

    return (
        <div className="portfolio">
            <div className="portfolio-header">
                <div className="portfolio-header-content">
                    <h3>Portfolio & Projects</h3>
                    {!isEditing && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="edit-portfolio-btn"
                            onClick={() => setIsEditing(true)}
                        >
                            <FiEdit /> Edit
                        </motion.button>
                    )}
                </div>
                <p className="portfolio-subtitle">
                    Showcase your work and projects to potential employers
                </p>
            </div>
            
            {isEditing ? (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="portfolio-edit-form"
                >
                    <div className="add-project-form">
                        <div className="form-group">
                            <label>Project Title</label>
                            <input
                                type="text"
                                value={newProject.title}
                                onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Project name"
                                className="project-input"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={newProject.description}
                                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe your project, challenges, and solutions"
                                className="description-input"
                                rows="3"
                            />
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Project URL</label>
                                <input
                                    type="url"
                                    value={newProject.url}
                                    onChange={(e) => setNewProject(prev => ({ ...prev, url: e.target.value }))}
                                    placeholder="https://yourproject.com"
                                    className="project-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Technologies</label>
                                <input
                                    type="text"
                                    value={newProject.technologies}
                                    onChange={(e) => setNewProject(prev => ({ ...prev, technologies: e.target.value }))}
                                    placeholder="e.g., React, Node.js, MongoDB"
                                    className="project-input"
                                />
                            </div>
                        </div>
                        
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="add-project-btn"
                            onClick={handleAddProject}
                        >
                            <FiPlus /> Add Project
                        </motion.button>
                    </div>
                    
                    <div className="projects-list">
                        {projectsData.map((project) => (
                            <div key={project.id} className="project-item">
                                <div className="project-header">
                                    <h5>{project.title}</h5>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="remove-project-btn"
                                        onClick={() => handleRemoveProject(project.id)}
                                    >
                                        <FiX />
                                    </motion.button>
                                </div>
                                <p className="project-description">{project.description}</p>
                                {project.url && (
                                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="project-link">
                                        <FiLink className="link-icon" /> View Project
                                    </a>
                                )}
                                {project.technologies && (
                                    <div className="technologies">
                                        <span className="tech-label">Technologies:</span>
                                        <span className="tech-list">{project.technologies}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <div className="portfolio-form-actions">
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
                <div className="portfolio-display">
                    {projectsData.length > 0 ? (
                        <div className="projects-display-list">
                            {projectsData.map((project, index) => (
                                <div key={index} className="project-display-item">
                                    <div className="project-display-header">
                                        <h5>{project.title}</h5>
                                        <FiFolder className="folder-icon" />
                                    </div>
                                    <p className="project-description">{project.description}</p>
                                    {project.url && (
                                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="project-link">
                                            <FiLink className="link-icon" /> View Project
                                        </a>
                                    )}
                                    {project.technologies && (
                                        <div className="technologies">
                                            <span className="tech-label">Technologies:</span>
                                            <span className="tech-list">{project.technologies}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-projects">No projects added yet</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Portfolio;
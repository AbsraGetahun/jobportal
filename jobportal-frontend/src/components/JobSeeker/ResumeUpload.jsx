import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiFile, FiX } from 'react-icons/fi';

const ResumeUpload = ({ onUpload, currentResume }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Check file type
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!validTypes.includes(selectedFile.type)) {
                setError('Please upload a PDF, DOC, or DOCX file');
                return;
            }
            
            // Check file size (max 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            
            setFile(selectedFile);
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file to upload');
            return;
        }
        
        setIsUploading(true);
        try {
            await onUpload(file);
            setFile(null);
        } catch (err) {
            setError('Failed to upload resume. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemove = () => {
        setFile(null);
        setError('');
    };

    return (
        <div className="resume-upload">
            <h3>Upload Resume</h3>
            <p className="resume-instructions">
                Upload your resume in PDF, DOC, or DOCX format (max 5MB)
            </p>
            
            <div className="file-upload-area">
                <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
                <label htmlFor="resume-upload" className="file-upload-label">
                    <FiUpload className="upload-icon" />
                    <span>Click to select file</span>
                    {file && (
                        <div className="selected-file">
                            <FiFile className="file-icon" />
                            <span>{file.name}</span>
                            <button 
                                type="button" 
                                className="remove-file"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleRemove();
                                }}
                            >
                                <FiX />
                            </button>
                        </div>
                    )}
                </label>
            </div>
            
            {error && <div className="upload-error">{error}</div>}
            
            <div className="upload-actions">
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="upload-btn"
                    onClick={handleUpload}
                    disabled={!file || isUploading}
                >
                    {isUploading ? 'Uploading...' : 'Upload Resume'}
                </motion.button>
            </div>
            
            {currentResume && (
                <div className="current-resume">
                    <h4>Current Resume</h4>
                    <div className="resume-info">
                        <FiFile className="file-icon" />
                        <span>resume.pdf</span>
                        <a href={currentResume} target="_blank" rel="noopener noreferrer" className="download-link">
                            Download
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeUpload;
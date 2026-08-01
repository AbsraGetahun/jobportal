import { useState } from 'react';

const ApplicantCard = ({ applicant, onAccept, onReject }) => {
    const [showDetails, setShowDetails] = useState(false);

    // Function to format resume URL for display
    const formatResumeUrl = (url) => {
        if (!url) return 'No resume uploaded';
        // Extract filename from URL
        const parts = url.split('/');
        return parts[parts.length - 1];
    };

    // Function to download resume
    const downloadResume = (url) => {
        if (!url) return;
        // Create full URL
        const fullUrl = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/storage/${url}`;
        window.open(fullUrl, '_blank');
    };

    return (
        <div className="applicant-card">
            <div className="applicant-header">
                <h3>{applicant.name}</h3>
                <div className="applicant-actions">
                    <button
                        onClick={onAccept}
                        className="accept-btn"
                    >
                        Accept
                    </button>
                    <button
                        onClick={onReject}
                        className="reject-btn"
                    >
                        Reject
                    </button>
                </div>
            </div>
            <div className="applicant-meta">
                <p><strong>Field of Study:</strong> {applicant.fieldOfStudy}</p>
                <p><strong>Degree:</strong> {applicant.degree}</p>
            </div>
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="details-btn"
            >
                {showDetails ? 'Hide Details' : 'View Details'}
            </button>

            {showDetails && (
                <div className="applicant-details">
                    <p><strong>Age:</strong> {applicant.age || 'Not specified'}</p>
                    <p><strong>Gender:</strong> {applicant.gender || 'Not specified'}</p>
                    <p><strong>Location:</strong> {applicant.location || 'Not specified'}</p>
                    <p><strong>Phone:</strong> {applicant.phoneNumber || 'Not specified'}</p>
                    <p><strong>Experience:</strong> {applicant.experience || 'Not specified'}</p>
                    <p><strong>Graduation Year:</strong> {applicant.graduationYear || 'Not specified'}</p>
                    
                    {/* Cover Letter */}
                    <div className="cover-letter-section">
                        <h4>Cover Letter</h4>
                        {applicant.coverLetter ? (
                            <p className="cover-letter-text">{applicant.coverLetter}</p>
                        ) : (
                            <p className="no-cover-letter">No cover letter provided</p>
                        )}
                    </div>
                    
                    {/* Resume */}
                    <div className="resume-section">
                        <h4>Resume</h4>
                        {applicant.resume ? (
                            <div className="resume-info">
                                <p><strong>File:</strong> {formatResumeUrl(applicant.resume)}</p>
                                <button
                                    onClick={() => downloadResume(applicant.resume)}
                                    className="download-resume-btn"
                                >
                                    Download Resume
                                </button>
                            </div>
                        ) : (
                            <p className="no-resume">No resume uploaded</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ApplicantCard;
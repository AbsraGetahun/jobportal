import { useState } from 'react';
import { FiEdit, FiTrash2, FiUsers, FiEye } from 'react-icons/fi';

const JobCard = ({ job, onEdit, onDelete, onViewApplicants, applicantCount }) => {
    const [showDetails, setShowDetails] = useState(false);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'status-approved';
            case 'pending':
                return 'status-pending';
            case 'rejected':
                return 'status-rejected';
            default:
                return 'status-default';
        }
    };

    return (
        <div className="job-card">
            <div className="job-header">
                <h3>{job.title}</h3>
                <span className={`status-badge ${getStatusColor(job.status)}`}>
                    {job.status || 'Unknown'}
                </span>
            </div>
            <div className="job-meta">
                <p>Posted: {new Date(job.created_at).toLocaleDateString()}</p>
                <p>Applicants: {applicantCount || 0}</p>
                <p>Location: {job.location}</p>
                <p>Type: {job.job_type}</p>
            </div>

            <div className="job-actions">
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="action-btn view-btn"
                >
                    <FiEye /> {showDetails ? 'Hide Details' : 'View Details'}
                </button>

                <button
                    onClick={onEdit}
                    className="action-btn edit-btn"
                >
                    <FiEdit /> Edit
                </button>

                <button
                    onClick={onDelete}
                    className="action-btn delete-btn"
                >
                    <FiTrash2 /> Delete
                </button>

                <button
                    onClick={onViewApplicants}
                    className="action-btn applicants-btn"
                >
                    <FiUsers /> View Applicants ({applicantCount || 0})
                </button>
            </div>

            {showDetails && (
                <div className="job-details">
                    <div className="detail-row">
                        <strong>Salary:</strong>
                        {job.salary_min && job.salary_max
                            ? `$${job.salary_min} - $${job.salary_max}`
                            : 'Not specified'
                        }
                    </div>
                    <div className="detail-row">
                        <strong>Category:</strong> {job.category}
                    </div>
                    <div className="detail-row">
                        <strong>Experience Level:</strong> {job.experience_level}
                    </div>
                    <div className="detail-row">
                        <strong>Job Type:</strong> {job.job_type}
                    </div>
                    <div className="detail-row">
                        <strong>Remote Work:</strong> {job.is_remote ? 'Yes' : 'No'}
                    </div>
                    {job.application_deadline && (
                        <div className="detail-row">
                            <strong>Application Deadline:</strong> {new Date(job.application_deadline).toLocaleDateString()}
                        </div>
                    )}
                    <div className="detail-row">
                        <strong>Description:</strong>
                        <p>{job.description}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobCard;
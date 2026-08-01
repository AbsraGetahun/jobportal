import { motion } from 'framer-motion';

const AppliedJobList = ({ jobs, statusColors }) => {
    return (
        <div className="applied-jobs-list">
            {jobs.length === 0 ? (
                <div className="empty-state">
                    <p>You haven't applied to any jobs yet.</p>
                </div>
            ) : (
                jobs.map((job) => (
                    <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="job-card"
                        whileHover={{ boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    >
                        <div className="job-header">
                            <div className="company-logo">
                                {job.logo ? (
                                    <img src={job.logo} alt={job.company} />
                                ) : (
                                    <div className="logo-placeholder">{job.company.charAt(0)}</div>
                                )}
                            </div>
                            <div className="job-info">
                                <h3>{job.title}</h3>
                                <p>{job.company}</p>
                            </div>
                        </div>
                        <div className="job-details">
                            <div className="detail-item">
                                <span className="detail-label">Applied:</span>
                                <span>{new Date(job.appliedDate).toLocaleDateString()}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">Status:</span>
                                <span
                                    className="status-badge"
                                    style={{ backgroundColor: statusColors[job.status] || '#6b7280' }}
                                >
                                    {job.status}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
    );
};

export default AppliedJobList;
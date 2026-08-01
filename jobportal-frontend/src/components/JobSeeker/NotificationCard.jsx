import { FiChevronDown, FiChevronUp, FiCheck } from 'react-icons/fi';

const NotificationCard = ({ subject, company, time, message, isRead, isExpanded, onToggle }) => {
    return (
        <div className={`notification-card ${isRead ? 'read' : ''}`}>
            <div className="notification-summary" onClick={onToggle}>
                <div className="notification-content">
                    <h3 className="notification-subject">{subject}</h3>
                    <div className="notification-meta">
                        <span className="notification-company">{company}</span>
                        <span className="notification-time">{time}</span>
                    </div>
                </div>
                <div className="notification-actions">
                    {isRead ? (
                        <FiCheck className="read-icon" />
                    ) : (
                        <span className="unread-badge">New</span>
                    )}
                    {isExpanded ? (
                        <FiChevronUp className="expand-icon" />
                    ) : (
                        <FiChevronDown className="expand-icon" />
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="notification-details">
                    <p className="notification-message">{message}</p>
                </div>
            )}
        </div>
    );
};

export default NotificationCard;
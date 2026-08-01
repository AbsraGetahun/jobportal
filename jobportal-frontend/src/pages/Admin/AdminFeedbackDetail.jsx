import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FiMessageSquare, FiUser, FiMail, FiCalendar, FiCheckCircle, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';

function AdminFeedbackDetail() {
    const { feedbackId } = useParams();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return savedTheme;
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const response = await api.get(`/admin/feedback/${feedbackId}`);
                setFeedback(response.data);
            } catch (err) {
                setError(err.message || 'Failed to fetch feedback details');
            } finally {
                setLoading(false);
            }
        };

        fetchFeedback();
    }, [feedbackId]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleResolveFeedback = async () => {
        try {
            await api.put(`/admin/feedback/${feedbackId}`, { is_resolved: true });
            setFeedback(prevFeedback => ({ ...prevFeedback, is_resolved: true }));
        } catch (err) {
            console.error('Failed to resolve feedback:', err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!feedback) return <div>Feedback not found</div>;

    return (
        <div className={`admin-feedback-detail ${theme}`}>
            <header className="admin-header">
                <h1>Feedback Details</h1>
                <div className="admin-header-actions">
                    <button className="notification-button" onClick={() => navigate('/admin/feedback')}>
                        <FiBell />
                        <span className="notification-badge">3</span>
                    </button>
                    <button className="theme-toggle" onClick={toggleTheme}>
                        {theme === 'light' ? <FiMoon /> : <FiSun />}
                    </button>
                    <button className="logout-button" onClick={handleLogout}>
                        <FiLogOut /> Logout
                    </button>
                </div>
            </header>

            <main className="admin-main">
                <div className="feedback-detail-card">
                    <div className="feedback-header">
                        <h2>{feedback.subject}</h2>
                        <div className="feedback-status">
                            {feedback.is_resolved ? (
                                <span className="resolved-status">
                                    <FiCheckCircle className="resolved-icon" /> Resolved
                                </span>
                            ) : (
                                <span className="pending-status">Pending</span>
                            )}
                        </div>
                    </div>

                    <div className="feedback-details">
                        <div className="detail-row">
                            <FiUser className="detail-icon" />
                            <span className="detail-label">User:</span>
                            <span className="detail-value">
                                {feedback.user ? feedback.user.name : 'Anonymous'}
                            </span>
                        </div>
                        <div className="detail-row">
                            <FiMail className="detail-icon" />
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">
                                {feedback.user ? feedback.user.email : feedback.email || 'N/A'}
                            </span>
                        </div>
                        <div className="detail-row">
                            <FiCalendar className="detail-icon" />
                            <span className="detail-label">Date:</span>
                            <span className="detail-value">
                                {new Date(feedback.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    <div className="feedback-message">
                        <h3>Message</h3>
                        <p>{feedback.message}</p>
                    </div>

                    <div className="feedback-actions">
                        {!feedback.is_resolved && (
                            <button 
                                className="resolve-button"
                                onClick={handleResolveFeedback}
                            >
                                Mark as Resolved
                            </button>
                        )}
                        <button 
                            className="back-button"
                            onClick={() => navigate('/admin/feedback')}
                        >
                            Back to Feedback
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminFeedbackDetail;
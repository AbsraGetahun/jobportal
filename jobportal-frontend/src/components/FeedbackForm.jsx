import React, { useState } from 'react';
import { FiSend, FiMessageSquare, FiMail, FiUser } from 'react-icons/fi';
import api from '../api';
import FeedbackMessage from './FeedbackMessage';

const FeedbackForm = () => {
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        email: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFeedbackMessage(null);

        try {
            await api.post('/feedback', formData);

            setFeedbackMessage({
                type: 'success',
                message: 'Thank you for your feedback! We appreciate your input and will review it shortly.'
            });

            // Reset form
            setFormData({
                subject: '',
                message: '',
                email: ''
            });

        } catch (error) {
            console.error('Error submitting feedback:', error);
            setFeedbackMessage({
                type: 'error',
                message: error.response?.data?.message || 'Failed to submit feedback. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="feedback-form-container">
            {/* Feedback Messages */}
            {feedbackMessage && (
                <FeedbackMessage
                    type={feedbackMessage.type}
                    message={feedbackMessage.message}
                    onClose={() => setFeedbackMessage(null)}
                />
            )}

            <div className="feedback-form-card">
                <div className="feedback-form-header">
                    <FiMessageSquare className="feedback-icon" />
                    <h3>Share Your Feedback</h3>
                    <p>Help us improve by sharing your thoughts, suggestions, or reporting issues.</p>
                </div>

                <form onSubmit={handleSubmit} className="feedback-form">
                    <div className="form-group">
                        <label htmlFor="subject" className="form-label">
                            <FiMessageSquare className="input-icon" />
                            Subject *
                        </label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            placeholder="Brief description of your feedback"
                            required
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            <FiMail className="input-icon" />
                            Email (Optional)
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your.email@example.com"
                            className="form-input"
                        />
                        <small className="form-help">We'll use this to follow up if needed</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="message" className="form-label">
                            <FiUser className="input-icon" />
                            Message *
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder="Please provide detailed feedback..."
                            required
                            rows="6"
                            className="form-textarea"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="submit-feedback-btn"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="loading-spinner"></div>
                                Sending...
                            </>
                        ) : (
                            <>
                                <FiSend className="btn-icon" />
                                Send Feedback
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FeedbackForm;
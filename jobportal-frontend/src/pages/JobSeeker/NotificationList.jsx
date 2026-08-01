import React, { useState, useEffect } from 'react';
import NotificationCard from '../../components/JobSeeker/NotificationCard';
import api from '../../api';
import '../../styles/pages/JobSeeker/NotificationList.css';

const NotificationList = () => {
    const [notifications, setNotifications] = useState([]);
    const [expandedNotification, setExpandedNotification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.getNotifications();
            setNotifications(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.markNotificationAsRead(id);
            setNotifications(notifications.map(notification =>
                notification.id === id ? { ...notification, isRead: true } : notification
            ));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const toggleExpand = (id) => {
        if (expandedNotification === id) {
            setExpandedNotification(null);
        } else {
            setExpandedNotification(id);
            // Mark as read when expanding
            markAsRead(id);
        }
    };

    const formatTime = (timestamp) => {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInHours = Math.floor((now - notificationTime) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
            return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        } else if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
        } else {
            return notificationTime.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };

    if (loading) {
        return <div className="notification-page">Loading notifications...</div>;
    }

    if (error) {
        return <div className="notification-page error">{error}</div>;
    }

    return (
        <div className="notification-page">
            <div className="notification-header">
                <h1>Notifications</h1>
                <p className="unread-count">
                    {notifications.filter(n => !n.isRead).length} unread
                </p>
            </div>

            <div className="notification-list">
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <NotificationCard
                            key={notification.id}
                            subject={notification.title}
                            company={notification.data?.company_name || 'System'}
                            time={formatTime(notification.created_at)}
                            message={notification.message}
                            isRead={notification.isRead}
                            isExpanded={expandedNotification === notification.id}
                            onToggle={() => toggleExpand(notification.id)}
                        />
                    ))
                ) : (
                    <div className="no-notifications">No notifications found</div>
                )}
            </div>
        </div>
    );
};

export default NotificationList;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import '../../styles/pages/Employer/EmployerNotifications.css';

const EmployerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.getNotifications();
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications(notifications.map(notif =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.deleteNotification(notificationId);
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job_posted':
        return '📋';
      case 'job_approved':
        return '✅';
      case 'job_rejected':
        return '❌';
      case 'application_received':
        return '📨';
      default:
        return '🔔';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="employer-notifications">
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employer-notifications">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="employer-notifications">
      <div className="notifications-header">
        <h1>My Notifications</h1>
        <div className="notifications-actions">
          {unreadCount > 0 && (
            <button
              className="btn-mark-all-read"
              onClick={markAllAsRead}
            >
              Mark All as Read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      <div className="notifications-stats">
        <div className="stat-item">
          <span className="stat-number">{notifications.length}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{unreadCount}</span>
          <span className="stat-label">Unread</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{notifications.filter(n => n.is_read).length}</span>
          <span className="stat-label">Read</span>
        </div>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <div className="no-notifications-icon">🔔</div>
            <h3>No notifications yet</h3>
            <p>When your jobs are approved or you receive applications, you'll see them here.</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="notification-content">
                <div className="notification-title">
                  {notification.title}
                  {!notification.is_read && <span className="unread-indicator"></span>}
                </div>
                <div className="notification-message">
                  {notification.message}
                </div>
                <div className="notification-meta">
                  <span className="notification-date">
                    {formatDate(notification.created_at)}
                  </span>
                  <span className="notification-type">
                    {notification.type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="notification-actions">
                {!notification.is_read && (
                  <button
                    className="btn-mark-read"
                    onClick={() => markAsRead(notification.id)}
                    title="Mark as read"
                  >
                    ✓
                  </button>
                )}
                <button
                  className="btn-delete"
                  onClick={() => deleteNotification(notification.id)}
                  title="Delete notification"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployerNotifications;
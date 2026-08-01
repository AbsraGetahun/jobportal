import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/pages/Admin/AdminNotifications.css';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Use the correct token key from AuthContext (access_token)
      const token = localStorage.getItem('access_token');

      // Debug: Log token information
      console.log('🔍 Debug Info:');
      console.log('Token exists:', !!token);
      console.log('Token length:', token ? token.length : 0);
      console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'NO TOKEN');

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Use the backend API URL (VITE_API_URL already includes /api)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Success! Notifications loaded:', data);
      setNotifications(data);
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('access_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      await fetch(`${apiUrl}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      // Update local state
      setNotifications(notifications.map(notif =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      await fetch(`${apiUrl}/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      // Update local state
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('access_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      await fetch(`${apiUrl}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      // Update local state
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
      default:
        return '🔔';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="admin-notifications">
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-notifications">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="admin-notifications">
      <div className="notifications-header">
        <h1>Admin Notifications</h1>
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
            <p>When employers post jobs or other events occur, you'll see them here.</p>
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

export default AdminNotifications;
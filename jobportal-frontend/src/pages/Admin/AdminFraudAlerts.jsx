import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FiAlertTriangle, FiCheckCircle, FiXCircle, FiSearch, FiFilter, FiLogOut, FiSun, FiMoon, FiHome, FiBell, FiShield, FiEye } from 'react-icons/fi';
import '../../styles/pages/Admin/AdminFraudAlerts.css';

function AdminFraudAlerts() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [filteredAlerts, setFilteredAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all', // all, open, investigating, resolved, dismissed
        severity: 'all', // all, low, medium, high, critical
        type: 'all', // all, suspicious_activity, duplicate_application, fake_profile, etc.
        dateFrom: '',
        dateTo: '',
        sortBy: 'created_at', // created_at, severity, type
        sortOrder: 'desc' // asc, desc
    });
    const [showFilters, setShowFilters] = useState(false);
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
        const fetchAlerts = async () => {
            try {
                const response = await api.getAdminFraudAlerts();
                const alertsData = Array.isArray(response.data) ? response.data : [];
                setAlerts(alertsData);
                setFilteredAlerts(alertsData);
            } catch (err) {
                setError(err.message || 'Failed to fetch fraud alerts');
                setAlerts([]);
                setFilteredAlerts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
    }, []);

    useEffect(() => {
        if (!Array.isArray(alerts)) {
            setFilteredAlerts([]);
            return;
        }

        let filtered = alerts.filter(alert => {
            // Search term filter
            const matchesSearch = !searchTerm ||
                alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (alert.user && alert.user.name.toLowerCase().includes(searchTerm.toLowerCase()));

            // Status filter
            const matchesStatus = filters.status === 'all' || alert.status === filters.status;

            // Severity filter
            const matchesSeverity = filters.severity === 'all' || alert.severity === filters.severity;

            // Type filter
            const matchesType = filters.type === 'all' || alert.type === filters.type;

            // Date range filter
            const alertDate = new Date(alert.created_at);
            const matchesDateFrom = !filters.dateFrom || alertDate >= new Date(filters.dateFrom);
            const matchesDateTo = !filters.dateTo || alertDate <= new Date(filters.dateTo);

            return matchesSearch && matchesStatus && matchesSeverity && matchesType && matchesDateFrom && matchesDateTo;
        });

        // Sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (filters.sortBy) {
                case 'created_at':
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
                    break;
                case 'severity':
                    const severityOrder = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
                    aValue = severityOrder[a.severity] || 0;
                    bValue = severityOrder[b.severity] || 0;
                    break;
                case 'type':
                    aValue = a.type.toLowerCase();
                    bValue = b.type.toLowerCase();
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredAlerts(filtered);
    }, [searchTerm, alerts, filters]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const toggleSort = (column) => {
        setFilters(prev => ({
            ...prev,
            sortBy: column,
            sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc'
        }));
    };

    const clearFilters = () => {
        setFilters({
            status: 'all',
            severity: 'all',
            type: 'all',
            dateFrom: '',
            dateTo: '',
            sortBy: 'created_at',
            sortOrder: 'desc'
        });
        setSearchTerm('');
    };

    const handleInvestigateAlert = async (alertId) => {
        try {
            await api.investigateAdminFraudAlert(alertId);
            // Update alert status in state
            setAlerts(prevAlerts =>
                prevAlerts.map(alert =>
                    alert.id === alertId
                        ? { ...alert, status: 'investigating' }
                        : alert
                )
            );
        } catch (err) {
            console.error('Failed to update alert status:', err);
        }
    };

    const handleResolveAlert = async (alertId, resolution) => {
        try {
            await api.resolveAdminFraudAlert(alertId, { resolution });
            // Update alert status in state
            setAlerts(prevAlerts =>
                prevAlerts.map(alert =>
                    alert.id === alertId
                        ? { ...alert, status: 'resolved', resolution_notes: resolution }
                        : alert
                )
            );
        } catch (err) {
            console.error('Failed to resolve alert:', err);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return '#dc2626';
            case 'high': return '#ea580c';
            case 'medium': return '#d97706';
            case 'low': return '#65a30d';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'open': return <FiAlertTriangle className="status-icon open" />;
            case 'investigating': return <FiEye className="status-icon investigating" />;
            case 'resolved': return <FiCheckCircle className="status-icon resolved" />;
            case 'dismissed': return <FiXCircle className="status-icon dismissed" />;
            default: return <FiAlertTriangle className="status-icon" />;
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading fraud alerts...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <FiAlertTriangle className="error-icon" />
            <p>Error: {error}</p>
        </div>
    );

    return (
        <div className={`admin-fraud ${theme}`}>
            <header className="admin-header">
                <h1>
                    <FiShield className="header-icon" />
                    Fraud Detection & Alerts
                </h1>
                <div className="admin-header-actions">
                    <button className="dashboard-button" onClick={() => navigate('/admin/dashboard')}>
                        <FiHome /> Dashboard
                    </button>
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
                <div className="search-filter-container">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search alerts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
                        <FiFilter /> Advanced Filters
                    </button>
                    {(searchTerm || filters.status !== 'all' || filters.severity !== 'all' || filters.type !== 'all' || filters.dateFrom || filters.dateTo) && (
                        <button className="clear-filters-button" onClick={clearFilters}>
                            Clear Filters
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="advanced-filters">
                        <div className="filter-row">
                            <div className="filter-group">
                                <label>Status:</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="open">Open</option>
                                    <option value="investigating">Investigating</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="dismissed">Dismissed</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Severity:</label>
                                <select
                                    value={filters.severity}
                                    onChange={(e) => handleFilterChange('severity', e.target.value)}
                                >
                                    <option value="all">All Severity</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Type:</label>
                                <select
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    <option value="suspicious_activity">Suspicious Activity</option>
                                    <option value="duplicate_application">Duplicate Application</option>
                                    <option value="fake_profile">Fake Profile</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Date From:</label>
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <label>Date To:</label>
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <label>Sort By:</label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                >
                                    <option value="created_at">Date Created</option>
                                    <option value="severity">Severity</option>
                                    <option value="type">Type</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Order:</label>
                                <select
                                    value={filters.sortOrder}
                                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                                >
                                    <option value="asc">Ascending</option>
                                    <option value="desc">Descending</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="alerts-summary">
                    <div className="summary-card">
                        <h3>Total Alerts</h3>
                        <p className="summary-value">{alerts.length}</p>
                    </div>
                    <div className="summary-card">
                        <h3>Open Alerts</h3>
                        <p className="summary-value">{alerts.filter(a => a.status === 'open').length}</p>
                    </div>
                    <div className="summary-card">
                        <h3>Critical Alerts</h3>
                        <p className="summary-value">{alerts.filter(a => a.severity === 'critical').length}</p>
                    </div>
                    <div className="summary-card">
                        <h3>Resolved Today</h3>
                        <p className="summary-value">
                            {alerts.filter(a => a.status === 'resolved' && new Date(a.resolved_at).toDateString() === new Date().toDateString()).length}
                        </p>
                    </div>
                </div>

                <div className="alerts-list">
                    <table className="alerts-table">
                        <thead>
                            <tr>
                                <th onClick={() => toggleSort('type')} className="sortable-header">
                                    Type {filters.sortBy === 'type' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Description</th>
                                <th onClick={() => toggleSort('severity')} className="sortable-header">
                                    Severity {filters.sortBy === 'severity' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>User</th>
                                <th>Status</th>
                                <th onClick={() => toggleSort('created_at')} className="sortable-header">
                                    Created {filters.sortBy === 'created_at' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(filteredAlerts) && filteredAlerts.map(alert => (
                                <tr key={alert.id} className={`alert-row severity-${alert.severity}`}>
                                    <td>
                                        <span className="alert-type">{alert.type.replace('_', ' ').toUpperCase()}</span>
                                    </td>
                                    <td className="alert-description">{alert.description}</td>
                                    <td>
                                        <span
                                            className="severity-badge"
                                            style={{ backgroundColor: getSeverityColor(alert.severity) }}
                                        >
                                            {alert.severity.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{alert.user ? alert.user.name : 'N/A'}</td>
                                    <td>
                                        <span className={`status-indicator status-${alert.status}`}>
                                            {getStatusIcon(alert.status)}
                                            {alert.status}
                                        </span>
                                    </td>
                                    <td>{new Date(alert.created_at).toLocaleDateString()}</td>
                                    <td>
                                        {alert.status === 'open' && (
                                            <button
                                                className="investigate-button"
                                                onClick={() => handleInvestigateAlert(alert.id)}
                                            >
                                                Investigate
                                            </button>
                                        )}
                                        {alert.status === 'investigating' && (
                                            <div className="resolution-actions">
                                                <button
                                                    className="resolve-button"
                                                    onClick={() => handleResolveAlert(alert.id, 'Resolved')}
                                                >
                                                    Resolve
                                                </button>
                                                <button
                                                    className="dismiss-button"
                                                    onClick={() => handleResolveAlert(alert.id, 'Dismissed')}
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        )}
                                        {alert.status === 'resolved' && (
                                            <span className="resolved-text">Resolved</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredAlerts.length === 0 && (
                        <div className="no-alerts">
                            <FiShield className="no-alerts-icon" />
                            <p>No fraud alerts found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default AdminFraudAlerts;
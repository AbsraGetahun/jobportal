import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FiSettings, FiSave, FiRefreshCw, FiSearch, FiFilter, FiLogOut, FiSun, FiMoon, FiHome, FiBell, FiShield, FiMail, FiCreditCard, FiGlobe } from 'react-icons/fi';
import '../../styles/pages/Admin/AdminSystemSettings.css';

function AdminSystemSettings() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [settings, setSettings] = useState([]);
    const [filteredSettings, setFilteredSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        group: 'all',
        type: 'all',
        sortBy: 'key',
        sortOrder: 'asc'
    });
    const [showFilters, setShowFilters] = useState(false);
    const [editingSetting, setEditingSetting] = useState(null);
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return savedTheme;
    });

    // Check if user is admin
    useEffect(() => {
        if (!user || !user.is_admin) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, settings, filters]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching system settings...');

            const response = await api.getAdminSettings();
            console.log('Settings response:', response);

            if (response && response.data) {
                const settingsData = Array.isArray(response.data) ? response.data : [];
                console.log('Settings data:', settingsData);
                setSettings(settingsData);
                setFilteredSettings(settingsData);
            } else {
                console.error('Invalid response format:', response);
                setError('Invalid response format from server');
                setSettings([]);
                setFilteredSettings([]);
            }
        } catch (err) {
            console.error('Failed to fetch system settings:', err);
            setError(err.message || 'Failed to fetch system settings');
            setSettings([]);
            setFilteredSettings([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        if (!Array.isArray(settings)) {
            setFilteredSettings([]);
            return;
        }

        let filtered = settings.filter(setting => {
            const matchesSearch = !searchTerm ||
                setting.key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                setting.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                setting.group?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesGroup = filters.group === 'all' || setting.group === filters.group;
            const matchesType = filters.type === 'all' || setting.type === filters.type;

            return matchesSearch && matchesGroup && matchesType;
        });

        // Sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (filters.sortBy) {
                case 'key':
                    aValue = a.key?.toLowerCase() || '';
                    bValue = b.key?.toLowerCase() || '';
                    break;
                case 'group':
                    aValue = a.group?.toLowerCase() || '';
                    bValue = b.group?.toLowerCase() || '';
                    break;
                case 'updated_at':
                    aValue = new Date(a.updated_at || a.created_at || 0);
                    bValue = new Date(b.updated_at || b.created_at || 0);
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredSettings(filtered);
    };

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
            group: 'all',
            type: 'all',
            sortBy: 'key',
            sortOrder: 'asc'
        });
        setSearchTerm('');
    };

    const handleUpdateSetting = async (settingId, newValue) => {
        try {
            console.log('Updating setting:', settingId, newValue);
            await api.updateAdminSetting(settingId, { value: newValue });

            setSettings(prevSettings =>
                prevSettings.map(setting =>
                    setting.id === settingId
                        ? { ...setting, value: newValue, updated_at: new Date().toISOString() }
                        : setting
                )
            );
            setEditingSetting(null);
        } catch (err) {
            console.error('Failed to update setting:', err);
            alert('Failed to update setting: ' + err.message);
        }
    };

    const handleBulkUpdate = async (updates) => {
        try {
            console.log('Bulk updating settings...');
            await api.bulkUpdateAdminSettings(updates);
            await fetchSettings(); // Refresh all settings
        } catch (err) {
            console.error('Failed to bulk update settings:', err);
            alert('Failed to save changes: ' + err.message);
        }
    };

    const getGroupIcon = (group) => {
        switch (group) {
            case 'security': return <FiShield />;
            case 'email': return <FiMail />;
            case 'payment': return <FiCreditCard />;
            case 'general': return <FiSettings />;
            default: return <FiGlobe />;
        }
    };

    const renderSettingInput = (setting) => {
        switch (setting.type) {
            case 'boolean':
                return (
                    <select
                        value={setting.value || 'false'}
                        onChange={(e) => handleUpdateSetting(setting.id, e.target.value)}
                        className="setting-input"
                    >
                        <option value="true">True</option>
                        <option value="false">False</option>
                    </select>
                );
            case 'integer':
                return (
                    <input
                        type="number"
                        value={setting.value || ''}
                        onChange={(e) => handleUpdateSetting(setting.id, e.target.value)}
                        placeholder="Enter number"
                        className="setting-input"
                    />
                );
            case 'json':
                return (
                    <textarea
                        value={setting.value || ''}
                        onChange={(e) => handleUpdateSetting(setting.id, e.target.value)}
                        placeholder="Enter JSON"
                        rows="3"
                        className="setting-input"
                    />
                );
            default:
                return (
                    <input
                        type="text"
                        value={setting.value || ''}
                        onChange={(e) => handleUpdateSetting(setting.id, e.target.value)}
                        placeholder="Enter value"
                        className="setting-input"
                    />
                );
        }
    };

    if (loading) {
        return (
            <div className="admin-settings">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading system settings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-settings">
                <div className="error-container">
                    <FiSettings className="error-icon" />
                    <p>Error: {error}</p>
                    <button onClick={fetchSettings} className="retry-button">
                        <FiRefreshCw /> Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`admin-settings ${theme}`}>
            <header className="admin-header">
                <h1>
                    <FiSettings className="header-icon" />
                    System Settings
                </h1>
                <div className="admin-header-actions">
                    <button
                        className="save-all-button"
                        onClick={() => handleBulkUpdate([])}
                        title="Save All Changes"
                    >
                        <FiSave /> Save All Changes
                    </button>
                    <button
                        className="refresh-button"
                        onClick={fetchSettings}
                        title="Refresh"
                    >
                        <FiRefreshCw /> Refresh
                    </button>
                    <button
                        className="dashboard-button"
                        onClick={() => navigate('/admin/dashboard')}
                        title="Dashboard"
                    >
                        <FiHome /> Dashboard
                    </button>
                    <button
                        className="notification-button"
                        onClick={() => navigate('/admin/feedback')}
                        title="Notifications"
                    >
                        <FiBell />
                        <span className="notification-badge">3</span>
                    </button>
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        title="Toggle Theme"
                    >
                        {theme === 'light' ? <FiMoon /> : <FiSun />}
                    </button>
                    <button
                        className="logout-button"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        <FiLogOut /> Logout
                    </button>
                </div>
            </header>

            <main className="admin-main">
                <div className="settings-summary">
                    <div className="summary-card">
                        <h3>Total Settings</h3>
                        <p className="summary-value">{settings.length}</p>
                    </div>
                    <div className="summary-card">
                        <h3>Groups</h3>
                        <p className="summary-value">{[...new Set(settings.map(s => s.group))].length}</p>
                    </div>
                    <div className="summary-card">
                        <h3>Public Settings</h3>
                        <p className="summary-value">{settings.filter(s => s.is_public).length}</p>
                    </div>
                    <div className="summary-card">
                        <h3>Recently Updated</h3>
                        <p className="summary-value">
                            {settings.filter(s => {
                                if (!s.updated_at) return false;
                                const updated = new Date(s.updated_at);
                                const weekAgo = new Date();
                                weekAgo.setDate(weekAgo.getDate() - 7);
                                return updated > weekAgo;
                            }).length}
                        </p>
                    </div>
                </div>

                <div className="search-filter-container">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search settings..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        className="filter-button"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter /> Advanced Filters
                    </button>
                    {(searchTerm || filters.group !== 'all' || filters.type !== 'all') && (
                        <button
                            className="clear-filters-button"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="advanced-filters">
                        <div className="filter-row">
                            <div className="filter-group">
                                <label>Group:</label>
                                <select
                                    value={filters.group}
                                    onChange={(e) => handleFilterChange('group', e.target.value)}
                                >
                                    <option value="all">All Groups</option>
                                    <option value="general">General</option>
                                    <option value="security">Security</option>
                                    <option value="email">Email</option>
                                    <option value="payment">Payment</option>
                                    <option value="applications">Applications</option>
                                    <option value="fraud">Fraud</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Type:</label>
                                <select
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    <option value="string">String</option>
                                    <option value="boolean">Boolean</option>
                                    <option value="integer">Integer</option>
                                    <option value="json">JSON</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Sort By:</label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                >
                                    <option value="key">Key</option>
                                    <option value="group">Group</option>
                                    <option value="updated_at">Updated Date</option>
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

                <div className="settings-list">
                    <table className="settings-table">
                        <thead>
                            <tr>
                                <th
                                    onClick={() => toggleSort('key')}
                                    className="sortable-header"
                                >
                                    Setting Key {filters.sortBy === 'key' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th
                                    onClick={() => toggleSort('group')}
                                    className="sortable-header"
                                >
                                    Group {filters.sortBy === 'group' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Type</th>
                                <th>Value</th>
                                <th>Description</th>
                                <th
                                    onClick={() => toggleSort('updated_at')}
                                    className="sortable-header"
                                >
                                    Updated {filters.sortBy === 'updated_at' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(filteredSettings) && filteredSettings.length > 0 ? (
                                filteredSettings.map(setting => (
                                    <tr key={setting.id}>
                                        <td className="setting-key">{setting.key}</td>
                                        <td>
                                            <div className="group-info">
                                                {getGroupIcon(setting.group)}
                                                <span className="group-name">{setting.group}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`type-badge type-${setting.type}`}>
                                                {setting.type}
                                            </span>
                                        </td>
                                        <td className="setting-value">
                                            {editingSetting === setting.id ? (
                                                renderSettingInput(setting)
                                            ) : (
                                                <span className="value-display">
                                                    {setting.type === 'boolean'
                                                        ? (setting.value === 'true' ? 'True' : 'False')
                                                        : setting.value || 'Not set'
                                                    }
                                                </span>
                                            )}
                                        </td>
                                        <td className="setting-description">
                                            {setting.description || 'No description'}
                                        </td>
                                        <td>
                                            {setting.updated_at
                                                ? new Date(setting.updated_at).toLocaleDateString()
                                                : 'Never'
                                            }
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {editingSetting === setting.id ? (
                                                    <>
                                                        <button
                                                            className="save-button"
                                                            onClick={() => setEditingSetting(null)}
                                                            title="Save"
                                                        >
                                                            <FiSave />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        className="edit-button"
                                                        onClick={() => setEditingSetting(setting.id)}
                                                        title="Edit Setting"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="no-data">
                                        No settings found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Settings Groups Overview */}
                <div className="settings-groups">
                    <h2>Settings by Group</h2>
                    <div className="groups-grid">
                        {['general', 'security', 'email', 'payment', 'applications', 'fraud'].map(group => {
                            const groupSettings = settings.filter(s => s.group === group);
                            return (
                                <div key={group} className="group-card">
                                    <div className="group-header">
                                        {getGroupIcon(group)}
                                        <h3>{group.charAt(0).toUpperCase() + group.slice(1)}</h3>
                                    </div>
                                    <div className="group-stats">
                                        <div className="stat">
                                            <span className="stat-value">{groupSettings.length}</span>
                                            <span className="stat-label">Settings</span>
                                        </div>
                                        <div className="stat">
                                            <span className="stat-value">
                                                {groupSettings.filter(s => s.updated_at && new Date(s.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                                            </span>
                                            <span className="stat-label">Updated This Week</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminSystemSettings;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FiMessageSquare, FiUser, FiMail, FiSearch, FiFilter, FiLogOut, FiSun, FiMoon, FiClock, FiHome, FiBell } from 'react-icons/fi';
import '../../styles/pages/Admin/AdminFeedbackList.css';

function AdminFeedbackList() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [feedbacks, setFeedbacks] = useState([]);
    const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all', // all, resolved, pending
        dateFrom: '',
        dateTo: '',
        sortBy: 'created_at', // subject, created_at
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
        const fetchFeedbacks = async () => {
            try {
                const response = await api.getAdminFeedback();
                const feedbacksData = Array.isArray(response.data) ? response.data : [];
                setFeedbacks(feedbacksData);
                setFilteredFeedbacks(feedbacksData);
            } catch (err) {
                setError(err.message || 'Failed to fetch feedbacks');
                setFeedbacks([]);
                setFilteredFeedbacks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchFeedbacks();
    }, []);

    useEffect(() => {
        if (!Array.isArray(feedbacks)) {
            setFilteredFeedbacks([]);
            return;
        }

        let filtered = feedbacks.filter(feedback => {
            // Search term filter
            const matchesSearch = !searchTerm ||
                feedback.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                feedback.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (feedback.user && feedback.user.name.toLowerCase().includes(searchTerm.toLowerCase()));

            // Status filter
            const matchesStatus = filters.status === 'all' ||
                (filters.status === 'resolved' && feedback.is_resolved) ||
                (filters.status === 'pending' && !feedback.is_resolved);

            // Date range filter
            const feedbackDate = new Date(feedback.created_at);
            const matchesDateFrom = !filters.dateFrom || feedbackDate >= new Date(filters.dateFrom);
            const matchesDateTo = !filters.dateTo || feedbackDate <= new Date(filters.dateTo);

            return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
        });

        // Sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (filters.sortBy) {
                case 'subject':
                    aValue = a.subject.toLowerCase();
                    bValue = b.subject.toLowerCase();
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredFeedbacks(filtered);
    }, [searchTerm, feedbacks, filters]);

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
            dateFrom: '',
            dateTo: '',
            sortBy: 'created_at',
            sortOrder: 'desc'
        });
        setSearchTerm('');
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={`admin-feedbacks ${theme}`}>
            <header className="admin-header">
                <h1>User Feedback Management</h1>
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
                            placeholder="Search feedback..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
                        <FiFilter /> Advanced Filters
                    </button>
                    {(searchTerm || filters.status !== 'all' || filters.dateFrom || filters.dateTo) && (
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
                                    <option value="all">All</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="pending">Pending</option>
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
                                    <option value="subject">Subject</option>
                                    <option value="created_at">Date Created</option>
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

                <div className="feedbacks-list">
                    <table className="feedbacks-table">
                        <thead>
                            <tr>
                                <th onClick={() => toggleSort('subject')} className="sortable-header">
                                    Subject {filters.sortBy === 'subject' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>User</th>
                                <th>Email</th>
                                <th onClick={() => toggleSort('created_at')} className="sortable-header">
                                    Date {filters.sortBy === 'created_at' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(filteredFeedbacks) && filteredFeedbacks.map(feedback => (
                                <tr key={feedback.id}>
                                    <td>{feedback.subject}</td>
                                    <td>{feedback.user ? feedback.user.name : 'Anonymous'}</td>
                                    <td>{feedback.user ? feedback.user.email : feedback.email || 'N/A'}</td>
                                    <td>{new Date(feedback.created_at).toLocaleDateString()}</td>
                                    <td>
                                        {feedback.is_resolved ? (
                                            <span className="resolved-status">Resolved</span>
                                        ) : (
                                            <span className="pending-status">
                                                <FiClock className="pending-icon" /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className="view-button"
                                            onClick={() => navigate(`/admin/feedback/${feedback.id}`)}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

export default AdminFeedbackList;
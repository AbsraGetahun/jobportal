import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FiBriefcase, FiUser, FiCalendar, FiSearch, FiFilter, FiLogOut, FiSun, FiMoon, FiHome, FiBell, FiCheckCircle, FiXCircle, FiClock, FiEye } from 'react-icons/fi';
import '../../styles/pages/Admin/AdminApplicationList.css';

function AdminApplicationList() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all', // all, applied, shortlisted, rejected, hired
        dateFrom: '',
        dateTo: '',
        sortBy: 'created_at', // job_title, applicant_name, created_at
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
        const fetchApplications = async () => {
            try {
                const response = await api.getAdminApplications();
                const applicationsData = Array.isArray(response.data?.data) ? response.data.data : [];
                setApplications(applicationsData);
                setFilteredApplications(applicationsData);
            } catch (err) {
                setError(err.message || 'Failed to fetch applications');
                setApplications([]);
                setFilteredApplications([]);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    useEffect(() => {
        if (!Array.isArray(applications)) {
            setFilteredApplications([]);
            return;
        }

        let filtered = applications.filter(application => {
            // Search term filter
            const matchesSearch = !searchTerm ||
                application.job?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                application.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                application.job?.employer?.name.toLowerCase().includes(searchTerm.toLowerCase());

            // Status filter
            const matchesStatus = filters.status === 'all' ||
                application.status?.toLowerCase() === filters.status;

            // Date range filter
            const applicationDate = new Date(application.created_at);
            const matchesDateFrom = !filters.dateFrom || applicationDate >= new Date(filters.dateFrom);
            const matchesDateTo = !filters.dateTo || applicationDate <= new Date(filters.dateTo);

            return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
        });

        // Sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (filters.sortBy) {
                case 'job_title':
                    aValue = a.job?.title.toLowerCase() || '';
                    bValue = b.job?.title.toLowerCase() || '';
                    break;
                case 'applicant_name':
                    aValue = a.user?.name.toLowerCase() || '';
                    bValue = b.user?.name.toLowerCase() || '';
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

        setFilteredApplications(filtered);
    }, [searchTerm, applications, filters.status, filters.dateFrom, filters.dateTo, filters.sortBy, filters.sortOrder]);

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

    const handleUpdateStatus = async (applicationId, newStatus) => {
        try {
            await api.updateAdminApplication(applicationId, { status: newStatus });
            // Update the application's status in the state
            setApplications(prevApplications =>
                prevApplications.map(application =>
                    application.id === applicationId
                        ? { ...application, status: newStatus }
                        : application
                )
            );
        } catch (err) {
            console.error('Failed to update application status:', err);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            applied: { color: '#3b82f6', icon: FiClock, text: 'Applied' },
            shortlisted: { color: '#f59e0b', icon: FiCheckCircle, text: 'Shortlisted' },
            rejected: { color: '#ef4444', icon: FiXCircle, text: 'Rejected' },
            hired: { color: '#10b981', icon: FiCheckCircle, text: 'Hired' }
        };

        const config = statusConfig[status?.toLowerCase()] || statusConfig.applied;
        const IconComponent = config.icon;

        return (
            <span className="status-badge" style={{ backgroundColor: config.color }}>
                <IconComponent className="status-icon" />
                {config.text}
            </span>
        );
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={`admin-applications ${theme}`}>
            <header className="admin-header">
                <h1>Application Management</h1>
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
                            placeholder="Search applications..."
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
                                    <option value="all">All Status</option>
                                    <option value="applied">Applied</option>
                                    <option value="shortlisted">Shortlisted</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="hired">Hired</option>
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
                                    <option value="job_title">Job Title</option>
                                    <option value="applicant_name">Applicant Name</option>
                                    <option value="created_at">Date Applied</option>
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

                <div className="applications-list">
                    <table className="applications-table">
                        <thead>
                            <tr>
                                <th onClick={() => toggleSort('job_title')} className="sortable-header">
                                    Job Title {filters.sortBy === 'job_title' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => toggleSort('applicant_name')} className="sortable-header">
                                    Applicant {filters.sortBy === 'applicant_name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Company</th>
                                <th onClick={() => toggleSort('created_at')} className="sortable-header">
                                    Applied Date {filters.sortBy === 'created_at' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(filteredApplications) && filteredApplications.map(application => (
                                <tr key={application.id}>
                                    <td>{application.job?.title || 'N/A'}</td>
                                    <td>{application.user?.name || 'N/A'}</td>
                                    <td>{application.job?.employer?.name || 'N/A'}</td>
                                    <td>{new Date(application.created_at).toLocaleDateString()}</td>
                                    <td>{getStatusBadge(application.status)}</td>
                                    <td>
                                        <button
                                            className="view-button"
                                            onClick={() => navigate(`/admin/applications/${application.id}`)}
                                        >
                                            <FiEye /> View
                                        </button>
                                        {application.status !== 'hired' && (
                                            <>
                                                {application.status !== 'shortlisted' && (
                                                    <button
                                                        className="status-button shortlist"
                                                        onClick={() => handleUpdateStatus(application.id, 'shortlisted')}
                                                    >
                                                        Shortlist
                                                    </button>
                                                )}
                                                {application.status !== 'rejected' && (
                                                    <button
                                                        className="status-button reject"
                                                        onClick={() => handleUpdateStatus(application.id, 'rejected')}
                                                    >
                                                        Reject
                                                    </button>
                                                )}
                                                {application.status !== 'hired' && (
                                                    <button
                                                        className="status-button hire"
                                                        onClick={() => handleUpdateStatus(application.id, 'hired')}
                                                    >
                                                        Hire
                                                    </button>
                                                )}
                                            </>
                                        )}
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

export default AdminApplicationList;
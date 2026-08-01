import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FiBriefcase, FiMapPin, FiDollarSign, FiCalendar, FiSearch, FiFilter, FiLogOut, FiSun, FiMoon, FiCheckCircle, FiXCircle, FiClock, FiHome, FiBell } from 'react-icons/fi';
import '../../styles/pages/Admin/AdminPostedJobList.css';

function AdminPostedJobList() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all', // all, approved, pending, rejected
        deadlineFrom: '',
        deadlineTo: '',
        sortBy: 'title', // title, companyName, deadline, created_at
        sortOrder: 'asc' // asc, desc
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
        const fetchJobs = async () => {
            try {
                const response = await api.getAdminJobs();
                const jobsData = Array.isArray(response.data?.data) ? response.data.data : [];
                setJobs(jobsData);
                setFilteredJobs(jobsData);
            } catch (err) {
                setError(err.message || 'Failed to fetch jobs');
                setJobs([]);
                setFilteredJobs([]);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    useEffect(() => {
        if (!Array.isArray(jobs)) {
            setFilteredJobs([]);
            return;
        }

        let filtered = jobs.filter(job => {
            // Search term filter
            const matchesSearch = !searchTerm ||
                (job.title && typeof job.title === 'string' && job.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (job.employer?.name && typeof job.employer.name === 'string' && job.employer.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (job.location && typeof job.location === 'string' && job.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (job.category && typeof job.category === 'string' && job.category.toLowerCase().includes(searchTerm.toLowerCase()));

            // Status filter
            const matchesStatus = filters.status === 'all' ||
                (filters.status === 'approved' && job.status === 'approved') ||
                (filters.status === 'pending' && job.status === 'pending') ||
                (filters.status === 'rejected' && job.status === 'rejected');

            // Deadline date range filter
            const deadlineDate = new Date(job.application_deadline);
            const matchesDeadlineFrom = !filters.deadlineFrom || deadlineDate >= new Date(filters.deadlineFrom);
            const matchesDeadlineTo = !filters.deadlineTo || deadlineDate <= new Date(filters.deadlineTo);

            return matchesSearch && matchesStatus && matchesDeadlineFrom && matchesDeadlineTo;
        });

        // Sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (filters.sortBy) {
                case 'title':
                    aValue = String(a.title || '').toLowerCase();
                    bValue = String(b.title || '').toLowerCase();
                    break;
                case 'companyName':
                    aValue = String(a.employer?.name || '').toLowerCase();
                    bValue = String(b.employer?.name || '').toLowerCase();
                    break;
                case 'deadline':
                    aValue = new Date(a.application_deadline || Date.now());
                    bValue = new Date(b.application_deadline || Date.now());
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at || Date.now());
                    bValue = new Date(b.created_at || Date.now());
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredJobs(filtered);
    }, [searchTerm, jobs, filters]);

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
            deadlineFrom: '',
            deadlineTo: '',
            sortBy: 'title',
            sortOrder: 'asc'
        });
        setSearchTerm('');
    };

    const handleApproveJob = async (jobId, isApproved) => {
        try {
            const status = isApproved ? 'approved' : 'rejected';
            await api.put(`/admin/jobs/${jobId}`, { status });
            // Update the job's approval status in the state
            setJobs(prevJobs =>
                prevJobs.map(job =>
                    job.id === jobId
                        ? { ...job, status: status }
                        : job
                )
            );
        } catch (err) {
            console.error('Failed to update job approval status:', err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={`admin-jobs ${theme}`}>
            <header className="admin-header">
                <h1>Jobs Management</h1>
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
                            placeholder="Search jobs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
                        <FiFilter /> Advanced Filters
                    </button>
                    {(searchTerm || filters.status !== 'all' || filters.deadlineFrom || filters.deadlineTo) && (
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
                                    <option value="approved">Approved</option>
                                    <option value="pending">Pending</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Deadline From:</label>
                                <input
                                    type="date"
                                    value={filters.deadlineFrom}
                                    onChange={(e) => handleFilterChange('deadlineFrom', e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <label>Deadline To:</label>
                                <input
                                    type="date"
                                    value={filters.deadlineTo}
                                    onChange={(e) => handleFilterChange('deadlineTo', e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <label>Sort By:</label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                >
                                    <option value="title">Title</option>
                                    <option value="companyName">Company</option>
                                    <option value="deadline">Deadline</option>
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

                <div className="jobs-list">
                    <table className="jobs-table">
                        <thead>
                            <tr>
                                <th onClick={() => toggleSort('title')} className="sortable-header">
                                    Job Title {filters.sortBy === 'title' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => toggleSort('companyName')} className="sortable-header">
                                    Company {filters.sortBy === 'companyName' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Location</th>
                                <th>Salary</th>
                                <th onClick={() => toggleSort('deadline')} className="sortable-header">
                                    Deadline {filters.sortBy === 'deadline' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(filteredJobs) && filteredJobs.map(job => (
                                <tr key={job.id}>
                                    <td>{job.title || 'N/A'}</td>
                                    <td>{job.employer?.name || 'N/A'}</td>
                                    <td>{job.location || 'N/A'}</td>
                                    <td>
                                        {job.salary_min && job.salary_max
                                            ? `${job.salary_min} - ${job.salary_max} ${job.salary_type || ''}`
                                            : 'Negotiable'
                                        }
                                    </td>
                                    <td>{job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        {job.status === 'approved' ? (
                                            <span className="approved-status">
                                                <FiCheckCircle className="approved-icon" /> Approved
                                            </span>
                                        ) : job.status === 'rejected' ? (
                                            <span className="rejected-status">
                                                <FiXCircle className="rejected-icon" /> Rejected
                                            </span>
                                        ) : (
                                            <span className="pending-status">
                                                <FiClock className="pending-icon" /> Pending
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className="view-button"
                                            onClick={() => navigate(`/admin/jobs/${job.id}`)}
                                        >
                                            View
                                        </button>
                                        {job.status !== 'approved' && (
                                            <button
                                                className="approve-button"
                                                onClick={() => handleApproveJob(job.id, true)}
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {job.status !== 'rejected' && (
                                            <button
                                                className="reject-button"
                                                onClick={() => handleApproveJob(job.id, false)}
                                            >
                                                Reject
                                            </button>
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

export default AdminPostedJobList;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FiUser, FiMail, FiPhone, FiSearch, FiFilter, FiLogOut, FiSun, FiMoon, FiHome, FiBell, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import '../../styles/pages/Admin/AdminJobSeekerList.css';

function AdminJobSeekerList() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [jobSeekers, setJobSeekers] = useState([]);
    const [filteredJobSeekers, setFilteredJobSeekers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all', // all, verified, not_verified
        experience: 'all', // all, entry, mid, senior
        dateFrom: '',
        dateTo: '',
        sortBy: 'name', // name, email, created_at
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
        const fetchJobSeekers = async () => {
            try {
                const response = await api.getAdminJobSeekers();
                const jobSeekersData = Array.isArray(response.data?.data) ? response.data.data : [];
                setJobSeekers(jobSeekersData);
                setFilteredJobSeekers(jobSeekersData);
            } catch (err) {
                setError(err.message || 'Failed to fetch job seekers');
                setJobSeekers([]);
                setFilteredJobSeekers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchJobSeekers();
    }, []);

    useEffect(() => {
        if (!Array.isArray(jobSeekers)) {
            setFilteredJobSeekers([]);
            return;
        }

        let filtered = jobSeekers.filter(jobSeeker => {
            // Search term filter
            const matchesSearch = !searchTerm ||
                jobSeeker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                jobSeeker.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (jobSeeker.degree && jobSeeker.degree.toLowerCase().includes(searchTerm.toLowerCase()));

            // Status filter
            const matchesStatus = filters.status === 'all' ||
                (filters.status === 'verified' && jobSeeker.is_verified) ||
                (filters.status === 'not_verified' && !jobSeeker.is_verified);

            // Experience level filter
            const experience = jobSeeker.experience || 0;
            const matchesExperience = filters.experience === 'all' ||
                (filters.experience === 'entry' && experience < 2) ||
                (filters.experience === 'mid' && experience >= 2 && experience < 5) ||
                (filters.experience === 'senior' && experience >= 5);

            // Date range filter
            const jobSeekerDate = new Date(jobSeeker.created_at);
            const matchesDateFrom = !filters.dateFrom || jobSeekerDate >= new Date(filters.dateFrom);
            const matchesDateTo = !filters.dateTo || jobSeekerDate <= new Date(filters.dateTo);

            return matchesSearch && matchesStatus && matchesExperience && matchesDateFrom && matchesDateTo;
        });

        // Sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (filters.sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'email':
                    aValue = a.email.toLowerCase();
                    bValue = b.email.toLowerCase();
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

        setFilteredJobSeekers(filtered);
    }, [searchTerm, jobSeekers, filters.status, filters.experience, filters.dateFrom, filters.dateTo, filters.sortBy, filters.sortOrder]);

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
            experience: 'all',
            dateFrom: '',
            dateTo: '',
            sortBy: 'name',
            sortOrder: 'asc'
        });
        setSearchTerm('');
    };

    const handleVerifyJobSeeker = async (jobSeekerId, isVerified) => {
        try {
            await api.put(`/admin/jobseekers/${jobSeekerId}/verify`, { is_verified: isVerified });
            // Update the job seeker's verification status in the state
            setJobSeekers(prevJobSeekers =>
                prevJobSeekers.map(jobSeeker =>
                    jobSeeker.id === jobSeekerId
                        ? { ...jobSeeker, is_verified: isVerified }
                        : jobSeeker
                )
            );
        } catch (err) {
            console.error('Failed to update verification status:', err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={`admin-jobseekers ${theme}`}>
            <header className="admin-header">
                <h1>Job Seekers Management</h1>
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
                            placeholder="Search job seekers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
                        <FiFilter /> Advanced Filters
                    </button>
                    {(searchTerm || filters.status !== 'all' || filters.experience !== 'all' || filters.dateFrom || filters.dateTo) && (
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
                                    <option value="verified">Verified</option>
                                    <option value="not_verified">Not Verified</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Experience Level:</label>
                                <select
                                    value={filters.experience}
                                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                                >
                                    <option value="all">All Levels</option>
                                    <option value="entry">Entry Level (0-2 years)</option>
                                    <option value="mid">Mid Level (2-5 years)</option>
                                    <option value="senior">Senior Level (5+ years)</option>
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
                                    <option value="name">Name</option>
                                    <option value="email">Email</option>
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

                <div className="jobseekers-list">
                    <table className="jobseekers-table">
                        <thead>
                            <tr>
                                <th onClick={() => toggleSort('name')} className="sortable-header">
                                    Name {filters.sortBy === 'name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => toggleSort('email')} className="sortable-header">
                                    Email {filters.sortBy === 'email' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Phone</th>
                                <th>Degree</th>
                                <th>Experience</th>
                                <th>Verification Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(filteredJobSeekers) && filteredJobSeekers.map(jobSeeker => (
                                <tr key={jobSeeker.id}>
                                    <td>{jobSeeker.name}</td>
                                    <td>{jobSeeker.email}</td>
                                    <td>{jobSeeker.phone || 'N/A'}</td>
                                    <td>{jobSeeker.degree || 'N/A'}</td>
                                    <td>{jobSeeker.experience || 'N/A'} years</td>
                                    <td>
                                        {jobSeeker.is_verified ? (
                                            <span className="verified-status">
                                                <FiCheckCircle className="verified-icon" /> Verified
                                            </span>
                                        ) : (
                                            <span className="unverified-status">
                                                <FiXCircle className="unverified-icon" /> Not Verified
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className="view-button"
                                            onClick={() => navigate(`/admin/jobseekers/${jobSeeker.id}`)}
                                        >
                                            View
                                        </button>
                                        {!jobSeeker.is_verified && (
                                            <button
                                                className="verify-button"
                                                onClick={() => handleVerifyJobSeeker(jobSeeker.id, true)}
                                            >
                                                Verify
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

export default AdminJobSeekerList;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FiUser, FiMail, FiPhone, FiSearch, FiFilter, FiLogOut, FiSun, FiMoon, FiCheckCircle, FiXCircle, FiHome, FiBell } from 'react-icons/fi';
import '../../styles/pages/Admin/AdminEmployerList.css';

function AdminEmployerList() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [employers, setEmployers] = useState([]);
    const [filteredEmployers, setFilteredEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all', // all, verified, not_verified
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
        const fetchEmployers = async () => {
            try {
                const response = await api.getAdminEmployers();
                const employersData = Array.isArray(response.data?.data) ? response.data.data : [];
                setEmployers(employersData);
                setFilteredEmployers(employersData);
            } catch (err) {
                setError(err.message || 'Failed to fetch employers');
                setEmployers([]);
                setFilteredEmployers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployers();
    }, []);

    useEffect(() => {
        if (!Array.isArray(employers)) {
            setFilteredEmployers([]);
            return;
        }

        let filtered = employers.filter(employer => {
            // Search term filter
            const matchesSearch = !searchTerm ||
                employer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (employer.companyName && employer.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

            // Status filter
            const matchesStatus = filters.status === 'all' ||
                (filters.status === 'verified' && employer.companyVerified) ||
                (filters.status === 'not_verified' && !employer.companyVerified);

            // Date range filter
            const employerDate = new Date(employer.created_at);
            const matchesDateFrom = !filters.dateFrom || employerDate >= new Date(filters.dateFrom);
            const matchesDateTo = !filters.dateTo || employerDate <= new Date(filters.dateTo);

            return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
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

        setFilteredEmployers(filtered);
    }, [searchTerm, employers, filters]);

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
            sortBy: 'name',
            sortOrder: 'asc'
        });
        setSearchTerm('');
    };

    const handleVerifyCompany = async (employerId, isVerified) => {
        try {
            await api.put(`/admin/employers/${employerId}/verify`, { is_verified: isVerified });
            // Update the employer's verification status in the state
            setEmployers(prevEmployers => 
                prevEmployers.map(employer => 
                    employer.id === employerId 
                        ? { ...employer, companyVerified: isVerified } 
                        : employer
                )
            );
        } catch (err) {
            console.error('Failed to update verification status:', err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={`admin-employers ${theme}`}>
            <header className="admin-header">
                <h1>Employers Management</h1>
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
                            placeholder="Search employers..."
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
                                    <option value="verified">Verified</option>
                                    <option value="not_verified">Not Verified</option>
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

                <div className="employers-list">
                    <table className="employers-table">
                        <thead>
                            <tr>
                                <th onClick={() => toggleSort('name')} className="sortable-header">
                                    Employer Name {filters.sortBy === 'name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => toggleSort('email')} className="sortable-header">
                                    Email {filters.sortBy === 'email' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Phone</th>
                                <th>Company Name</th>
                                <th>Company Verified</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(filteredEmployers) && filteredEmployers.map(employer => (
                                <tr key={employer.id}>
                                    <td>{employer.name}</td>
                                    <td>{employer.email}</td>
                                    <td>{employer.phone || 'N/A'}</td>
                                    <td>{employer.companyName || 'N/A'}</td>
                                    <td>
                                        {employer.companyVerified ? (
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
                                            onClick={() => navigate(`/admin/employers/${employer.id}`)}
                                        >
                                            View
                                        </button>
                                        {!employer.companyVerified && (
                                            <button
                                                className="verify-button"
                                                onClick={() => handleVerifyCompany(employer.id, true)}
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

export default AdminEmployerList;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FiFileText, FiPlus, FiRefreshCw, FiSearch, FiFilter, FiLogOut, FiSun, FiMoon, FiHome, FiBell, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import '../../styles/pages/Admin/AdminCMS.css';

function AdminCMS() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [pages, setPages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredPages, setFilteredPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all', // all, published, draft
        sortBy: 'title', // title, created_at, updated_at
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
        fetchData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, pages, filters]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching CMS data...');

            // Fetch pages and categories in parallel
            const [pagesResponse, categoriesResponse] = await Promise.all([
                api.getAdminCMSPages(),
                api.getAdminCMSCategories()
            ]);

            console.log('Pages response:', pagesResponse);
            console.log('Categories response:', categoriesResponse);

            // Handle pages
            if (pagesResponse && pagesResponse.data) {
                const pagesData = Array.isArray(pagesResponse.data) ? pagesResponse.data : [];
                console.log('Pages data:', pagesData);
                setPages(pagesData);
                setFilteredPages(pagesData);
            } else {
                console.error('Invalid pages response format:', pagesResponse);
                setPages([]);
                setFilteredPages([]);
            }

            // Handle categories
            if (categoriesResponse && categoriesResponse.data) {
                const categoriesData = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];
                console.log('Categories data:', categoriesData);
                setCategories(categoriesData);
            } else {
                console.error('Invalid categories response format:', categoriesResponse);
                setCategories([]);
            }

        } catch (err) {
            console.error('Failed to fetch CMS data:', err);
            setError(err.message || 'Failed to fetch CMS data');
            setPages([]);
            setFilteredPages([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        if (!Array.isArray(pages)) {
            setFilteredPages([]);
            return;
        }

        let filtered = pages.filter(page => {
            const matchesSearch = !searchTerm ||
                page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                page.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                page.content?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = filters.status === 'all' ||
                (filters.status === 'published' && page.is_published) ||
                (filters.status === 'draft' && !page.is_published);

            return matchesSearch && matchesStatus;
        });

        // Sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (filters.sortBy) {
                case 'title':
                    aValue = a.title?.toLowerCase() || '';
                    bValue = b.title?.toLowerCase() || '';
                    break;
                case 'created_at':
                    aValue = new Date(a.created_at || 0);
                    bValue = new Date(b.created_at || 0);
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

        setFilteredPages(filtered);
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
            status: 'all',
            sortBy: 'title',
            sortOrder: 'asc'
        });
        setSearchTerm('');
    };

    const handleCreatePage = () => {
        // Navigate to create page (you can implement this)
        alert('Create page functionality would be implemented here');
    };

    const handleEditPage = (pageId) => {
        // Navigate to edit page (you can implement this)
        alert(`Edit page ${pageId} functionality would be implemented here`);
    };

    const handleDeletePage = async (pageId) => {
        if (!confirm('Are you sure you want to delete this page?')) {
            return;
        }

        try {
            await api.deleteAdminCMSPage(pageId);
            await fetchData(); // Refresh data
        } catch (err) {
            console.error('Failed to delete page:', err);
            alert('Failed to delete page: ' + err.message);
        }
    };

    const handleCreateCategory = () => {
        // Navigate to create category (you can implement this)
        alert('Create category functionality would be implemented here');
    };

    if (loading) {
        return (
            <div className="admin-cms">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading CMS data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-cms">
                <div className="error-container">
                    <FiFileText className="error-icon" />
                    <p>Error: {error}</p>
                    <button onClick={fetchData} className="retry-button">
                        <FiRefreshCw /> Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`admin-cms ${theme}`}>
            <header className="admin-header">
                <h1>
                    <FiFileText className="header-icon" />
                    Content Management System
                </h1>
                <div className="admin-header-actions">
                    <button
                        className="create-page-button"
                        onClick={handleCreatePage}
                        title="Create Page"
                    >
                        <FiPlus /> Create Page
                    </button>
                    <button
                        className="refresh-button"
                        onClick={fetchData}
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
                <div className="cms-summary">
                    <div className="summary-card">
                        <h3>Total Pages</h3>
                        <p className="summary-value">{pages.length}</p>
                    </div>
                    <div className="summary-card">
                        <h3>Published Pages</h3>
                        <p className="summary-value">{pages.filter(p => p.is_published).length}</p>
                    </div>
                    <div className="summary-card">
                        <h3>Draft Pages</h3>
                        <p className="summary-value">{pages.filter(p => !p.is_published).length}</p>
                    </div>
                    <div className="summary-card">
                        <h3>Categories</h3>
                        <p className="summary-value">{categories.length}</p>
                    </div>
                </div>

                <div className="search-filter-container">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search pages..."
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
                    {(searchTerm || filters.status !== 'all') && (
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
                                <label>Status:</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="all">All Pages</option>
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Sort By:</label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                >
                                    <option value="title">Title</option>
                                    <option value="created_at">Created Date</option>
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

                <div className="cms-content">
                    <div className="pages-section">
                        <h2>Pages</h2>
                        <table className="cms-table">
                            <thead>
                                <tr>
                                    <th
                                        onClick={() => toggleSort('title')}
                                        className="sortable-header"
                                    >
                                        Title {filters.sortBy === 'title' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                    </th>
                                    <th>Slug</th>
                                    <th>Status</th>
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
                                {Array.isArray(filteredPages) && filteredPages.length > 0 ? (
                                    filteredPages.map(page => (
                                        <tr key={page.id}>
                                            <td className="page-title">{page.title}</td>
                                            <td className="page-slug">/{page.slug}</td>
                                            <td>
                                                <span className={`status-badge ${page.is_published ? 'published' : 'draft'}`}>
                                                    {page.is_published ? 'Published' : 'Draft'}
                                                </span>
                                            </td>
                                            <td>
                                                {page.updated_at
                                                    ? new Date(page.updated_at).toLocaleDateString()
                                                    : new Date(page.created_at).toLocaleDateString()
                                                }
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="view-button"
                                                        onClick={() => alert(`View page: ${page.title}`)}
                                                        title="View Page"
                                                    >
                                                        <FiEye />
                                                    </button>
                                                    <button
                                                        className="edit-button"
                                                        onClick={() => handleEditPage(page.id)}
                                                        title="Edit Page"
                                                    >
                                                        <FiEdit />
                                                    </button>
                                                    <button
                                                        className="delete-button"
                                                        onClick={() => handleDeletePage(page.id)}
                                                        title="Delete Page"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="no-data">
                                            No pages found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="categories-section">
                        <div className="section-header">
                            <h2>Job Categories</h2>
                            <button
                                className="create-category-button"
                                onClick={handleCreateCategory}
                            >
                                <FiPlus /> Add Category
                            </button>
                        </div>

                        {Array.isArray(categories) && categories.length > 0 ? (
                            <div className="categories-grid">
                                {categories.map((category, index) => (
                                    <div key={index} className="category-card">
                                        <h3>{category.name || category}</h3>
                                        <p>{category.count || 0} jobs</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-categories">
                                <p>No categories found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminCMS;
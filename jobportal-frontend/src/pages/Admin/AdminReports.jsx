import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FiTrendingUp, FiUsers, FiBriefcase, FiBarChart, FiDownload, FiCalendar, FiLogOut, FiSun, FiMoon, FiHome, FiBell, FiPieChart, FiActivity } from 'react-icons/fi';
import '../../styles/pages/Admin/AdminReports.css';

function AdminReports() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [reports, setReports] = useState({
        userGrowth: [],
        jobStats: [],
        applicationStats: [],
        categoryStats: [],
        revenueStats: [],
        // Additional fields for different report types
        registrations: [],
        verifications: [],
        posted: [],
        approved: [],
        submitted: [],
        status: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [reportType, setReportType] = useState('overview');
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
        const fetchReports = async () => {
            try {
                const response = await api.getAdminReports({
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    type: reportType,
                    _t: Date.now() // Cache buster
                });

                const reportData = response.data?.data || response.data || {};

                console.log('Raw API response:', response.data);
                console.log('Processed report data:', reportData);
                console.log('Category stats:', reportData.categoryStats);
                console.log('Category stats type:', typeof reportData.categoryStats);
                console.log('Category stats length:', reportData.categoryStats?.length);

                // Force re-render by updating state
                setReports(prev => ({ ...prev, categoryStats: reportData.categoryStats || [] }));

                setReports({
                    userGrowth: reportData.userGrowth || [],
                    jobStats: reportData.jobStats || [],
                    applicationStats: reportData.applicationStats || [],
                    categoryStats: reportData.categoryStats || [],
                    revenueStats: reportData.revenueStats || [],
                    // Additional fields for different report types
                    registrations: reportData.registrations || [],
                    verifications: reportData.verifications || [],
                    posted: reportData.posted || [],
                    approved: reportData.approved || [],
                    submitted: reportData.submitted || [],
                    status: reportData.status || []
                });
            } catch (err) {
                setError(err.message || 'Failed to fetch reports');
                setReports({
                    userGrowth: [],
                    jobStats: [],
                    applicationStats: [],
                    categoryStats: [],
                    revenueStats: [],
                    // Additional fields for different report types
                    registrations: [],
                    verifications: [],
                    posted: [],
                    approved: [],
                    submitted: [],
                    status: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [dateRange, reportType]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDateChange = (field, value) => {
        setDateRange(prev => ({ ...prev, [field]: value }));
    };

    const exportReport = async (format = 'pdf') => {
        try {
            const response = await api.exportAdminReport({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                type: reportType,
                format
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `admin-report-${reportType}-${dateRange.startDate}-to-${dateRange.endDate}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Failed to export report:', err);
        }
    };

    const renderChart = (data, title, description, key = null) => {
        if (!data || data.length === 0) {
            return (
                <div key={key || `chart-${title.replace(/\s+/g, '-').toLowerCase()}`} className="chart-section">
                    <h4>{title}</h4>
                    <p className="chart-description">{description}</p>
                    <div className="no-data">
                        <div className="no-data-icon">📊</div>
                        <p>No data available for the selected period</p>
                        <small>
                            {title.includes('Verification') ?
                                'No verified users found. Users need to verify their accounts to appear here.' :
                                'Try adjusting the date range or check if data exists in the database'
                            }
                        </small>
                    </div>
                </div>
            );
        }

        const maxValue = Math.max(...data.map(item => item.value || 0));
        const totalValue = data.reduce((sum, item) => sum + (item.value || 0), 0);

        return (
            <div key={key || `chart-${title.replace(/\s+/g, '-').toLowerCase()}`} className="chart-section">
                <h4>{title}</h4>
                <p className="chart-description">{description}</p>
                <div className="chart-stats">
                    <div className="stat-item">
                        <span className="stat-label">Total:</span>
                        <span className="stat-value">{totalValue}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Peak:</span>
                        <span className="stat-value">{maxValue}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Average:</span>
                        <span className="stat-value">{data.length > 0 ? Math.round(totalValue / data.length) : 0}</span>
                    </div>
                </div>
                <div className="chart-container">
                    {data.map((item, index) => (
                        <div key={index} className="chart-bar">
                            <div className="bar-label">{item.label}</div>
                            <div className="bar-container">
                                <div
                                    className="bar-fill"
                                    style={{
                                        width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                                        backgroundColor: getChartColor(index)
                                    }}
                                >
                                    <span className="bar-value">{item.value}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="chart-insights">
                    <h5>Key Insights:</h5>
                    <ul>
                        {data.length > 0 && (
                            <>
                                <li><strong>Highest:</strong> {data.reduce((max, item) => item.value > max.value ? item : max).label} ({data.reduce((max, item) => item.value > max.value ? item : max).value})</li>
                                <li><strong>Lowest:</strong> {data.reduce((min, item) => item.value < min.value ? item : min).label} ({data.reduce((min, item) => item.value < min.value ? item : min).value})</li>
                                <li><strong>Trend:</strong> {data.length > 1 ? (data[data.length - 1].value > data[0].value ? 'Increasing' : data[data.length - 1].value < data[0].value ? 'Decreasing' : 'Stable') : 'N/A'}</li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        );
    };

    const getChartColor = (index) => {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
        return colors[index % colors.length];
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading reports...</p>
        </div>
    );

    if (error) return (
        <div className="loading-container">
            <p>Error: {error}</p>
        </div>
    );

    return (
        <div className={`admin-reports ${theme}`}>
            <header className="admin-header">
                <h1>Reports & Analytics</h1>
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
                <div className="reports-controls">
                    <div className="date-filters">
                        <div className="filter-group">
                            <label>Start Date:</label>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => handleDateChange('startDate', e.target.value)}
                            />
                        </div>
                        <div className="filter-group">
                            <label>End Date:</label>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => handleDateChange('endDate', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="report-type-selector">
                        <button
                            className={`type-btn ${reportType === 'overview' ? 'active' : ''}`}
                            onClick={() => setReportType('overview')}
                        >
                            <FiBarChart /> Overview
                        </button>
                        <button
                            className={`type-btn ${reportType === 'users' ? 'active' : ''}`}
                            onClick={() => setReportType('users')}
                        >
                            <FiUsers /> Users
                        </button>
                        <button
                            className={`type-btn ${reportType === 'jobs' ? 'active' : ''}`}
                            onClick={() => setReportType('jobs')}
                        >
                            <FiBriefcase /> Jobs
                        </button>
                        <button
                            className={`type-btn ${reportType === 'applications' ? 'active' : ''}`}
                            onClick={() => setReportType('applications')}
                        >
                            <FiActivity /> Applications
                        </button>
                    </div>

                    <div className="export-controls">
                        <button className="export-btn" onClick={() => exportReport('pdf')}>
                            <FiDownload /> Export PDF
                        </button>
                        <button className="export-btn" onClick={() => exportReport('excel')}>
                            <FiDownload /> Export Excel
                        </button>
                    </div>
                </div>

                <div className="reports-content">
                    {reportType === 'overview' && (
                        <div className="report-section">
                            <h2>Platform Overview</h2>
                            <p className="section-description">
                                Comprehensive analytics showing user growth, job market trends, and application patterns across the platform.
                            </p>
                            <div className="overview-grid">
                                {renderChart(reports.userGrowth, 'User Registration Trends',
                                    'Daily user registrations showing platform growth and user acquisition patterns over time.')}
                                {renderChart(reports.jobStats, 'Job Posting Activity',
                                    'Daily job postings indicating employer activity and market demand across different time periods.')}
                                {renderChart(reports.applicationStats, 'Application Volume',
                                    'Daily application submissions reflecting user engagement and job market activity.')}
                                {renderChart(reports.categoryStats, 'Popular Job Categories',
                                    'Distribution of job postings across different categories showing market demand and industry focus.')}
                            </div>
                        </div>
                    )}

                    {reportType === 'users' && (
                        <div className="report-section">
                            <h2>User Analytics</h2>
                            <p className="section-description">
                                Detailed analysis of user registration patterns, activity levels, and platform engagement metrics.
                            </p>
                            <div className="analytics-grid">
                                {renderChart(reports.registrations, 'New User Registrations',
                                    'Daily breakdown of new user signups showing registration trends and user acquisition effectiveness.')}
                                {renderChart(reports.verifications, 'User Verifications',
                                    'Daily user verification activity showing account activation and user engagement patterns.')}
                            </div>
                        </div>
                    )}

                    {reportType === 'jobs' && (
                        <div className="report-section">
                            <h2>Job Market Analytics</h2>
                            <p className="section-description">
                                Comprehensive insights into job market dynamics, employer activity, and industry demand patterns.
                            </p>
                            <div className="analytics-grid">
                                {renderChart(reports.categoryStats, 'Jobs by Category',
                                    'Distribution of job postings across different industries and sectors, highlighting market demand.', `category-${Date.now()}`)}
                                {renderChart(reports.posted, 'Job Posting Trends',
                                    'Daily job posting activity showing employer engagement and market supply patterns.')}
                                {renderChart(reports.approved, 'Job Approval Trends',
                                    'Daily job approval activity showing admin review efficiency and posting activation rates.')}
                            </div>
                        </div>
                    )}

                    {reportType === 'applications' && (
                        <div className="report-section">
                            <h2>Application Analytics</h2>
                            <p className="section-description">
                                In-depth analysis of application patterns, success rates, and candidate-employer matching effectiveness.
                            </p>
                            <div className="analytics-grid">
                                {renderChart(reports.status, 'Application Status Distribution',
                                    'Breakdown of application outcomes showing hiring funnel efficiency and candidate success rates.')}
                                {renderChart(reports.submitted, 'Application Submission Trends',
                                    'Daily application volume indicating user engagement and job market activity levels.')}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default AdminReports;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FiUsers, FiBriefcase, FiClock, FiMessageSquare, FiTrendingUp, FiLogOut, FiSun, FiMoon, FiBell, FiBarChart, FiActivity, FiTarget, FiShield, FiBookOpen, FiHeadphones, FiSettings } from 'react-icons/fi';
import '../../styles/pages/Admin/AdminDashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();
    const { logout, isAuthenticated, user, userType } = useAuth();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalEmployers: 0,
        totalJobSeekers: 0,
        activeJobs: 0,
        pendingJobs: 0,
        totalFeedback: 0,
        recentFeedback: 0,
        userGrowth: 0,
        jobGrowth: 0
    });
    const [aiInsights, setAiInsights] = useState({
        predictedUserGrowth: 0,
        trendingCategory: '',
        userEngagementScore: 0,
        anomalyCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
        // Check if user is authenticated and is an admin
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (userType !== 'admin') {
            // Redirect non-admin users to their appropriate dashboard
            if (userType === 'employer') {
                navigate('/employeraccount');
            } else if (userType === 'jobseeker') {
                navigate('/jobseekeraccount');
            } else {
                navigate('/');
            }
            return;
        }

        const fetchStats = async () => {
            try {
                // Fetch stats first
                const statsResponse = await api.getAdminStats();

                // Try to fetch AI insights, but don't fail if not available
                let aiResponse = { data: {} };
                try {
                    aiResponse = await api.getAIInsights();
                } catch (aiError) {
                    console.warn('AI Insights not available, using defaults:', aiError.message);
                }

                const statsData = statsResponse.data || {};
                setStats({
                    totalUsers: statsData.totalUsers || 0,
                    totalEmployers: statsData.totalEmployers || 0,
                    totalJobSeekers: statsData.totalJobSeekers || 0,
                    activeJobs: statsData.activeJobs || 0,
                    pendingJobs: statsData.pendingJobs || 0,
                    totalFeedback: statsData.totalFeedback || 0,
                    recentFeedback: statsData.recentFeedback || 0,
                    userGrowth: statsData.userGrowth || 0,
                    jobGrowth: statsData.jobGrowth || 0
                });

                const aiData = aiResponse.data || {};
                setAiInsights({
                    predictedUserGrowth: aiData.predictedUserGrowth || 0,
                    trendingCategory: aiData.trendingCategory || 'Technology',
                    userEngagementScore: aiData.userEngagementScore || 0,
                    anomalyCount: aiData.anomalyCount || 0
                });
            } catch (err) {
                setError(err.message || 'Failed to fetch dashboard statistics');
                setStats({
                    totalUsers: 0,
                    totalEmployers: 0,
                    totalJobSeekers: 0,
                    activeJobs: 0,
                    pendingJobs: 0,
                    totalFeedback: 0,
                    recentFeedback: 0,
                    userGrowth: 0,
                    jobGrowth: 0
                });
                setAiInsights({
                    predictedUserGrowth: 0,
                    trendingCategory: 'N/A',
                    userEngagementScore: 0,
                    anomalyCount: 0
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [isAuthenticated, userType]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
        </div>
    );
    if (error) return (
        <div className="loading-container">
            <p>Error: {error}</p>
        </div>
    );

    return (
        <div className={`admin-dashboard ${theme}`}>
            {/* Header - Consistent with App */}
            <header className="careerplus__header">
                <div className="careerplus__header-container">
                    <a href="/" className="careerplus__logo">CareerPlus</a>
                    <nav className="careerplus__nav">
                        <button
                            className="careerplus__nav-icon"
                            onClick={() => navigate('/admin/employers')}
                            title="Employers"
                        >
                            <FiUsers />
                        </button>
                        <button
                            className="careerplus__nav-icon"
                            onClick={() => navigate('/admin/jobseekers')}
                            title="Job Seekers"
                        >
                            <FiUsers />
                        </button>
                        <button
                            className="careerplus__nav-icon"
                            onClick={() => navigate('/admin/jobs')}
                            title="Jobs"
                        >
                            <FiBriefcase />
                        </button>
                        <button
                            className="careerplus__nav-icon"
                            onClick={() => navigate('/admin/applications')}
                            title="Applications"
                        >
                            <FiBarChart />
                        </button>
                        <button
                            className="careerplus__nav-icon"
                            onClick={() => navigate('/admin/reports')}
                            title="Reports"
                        >
                            <FiTrendingUp />
                        </button>
                        <button
                            className="careerplus__nav-icon notification-button"
                            onClick={() => navigate('/admin/notifications')}
                            title="Notifications"
                        >
                            <FiBell />
                            {stats.pendingJobs > 0 && (
                                <span className="notification-badge">{stats.pendingJobs}</span>
                            )}
                        </button>
                        <button
                            className="careerplus__nav-icon"
                            onClick={() => navigate('/admin/fraud')}
                            title="Fraud Detection"
                        >
                            <FiShield />
                        </button>
                        <button
                            className="careerplus__nav-icon"
                            onClick={() => navigate('/admin/cms')}
                            title="Content Management"
                        >
                            <FiBookOpen />
                        </button>
                        <button
                            className="careerplus__nav-icon"
                            onClick={() => navigate('/admin/support')}
                            title="Support & Communication"
                        >
                            <FiHeadphones />
                        </button>
                        <button
                            className="careerplus__nav-icon"
                            onClick={() => navigate('/admin/settings')}
                            title="System Settings"
                        >
                            <FiSettings />
                        </button>
                        <button
                            className="careerplus__theme-toggle"
                            onClick={toggleTheme}
                            title="Toggle Theme"
                        >
                            {theme === 'light' ? <FiMoon /> : <FiSun />}
                        </button>
                        <button
                            className="careerplus__nav-icon"
                            onClick={handleLogout}
                            title="Logout"
                        >
                            <FiLogOut />
                        </button>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <div className="account-container">
                {/* Sidebar */}
                <aside className="account-sidebar">
                    <a href="/admin/dashboard" className="sidebar-item active">
                        <FiUsers className="sidebar-icon" />
                        <span>Dashboard</span>
                    </a>
                    <a href="/admin/employers" className="sidebar-item">
                        <FiUsers className="sidebar-icon" />
                        <span>Employers</span>
                    </a>
                    <a href="/admin/jobseekers" className="sidebar-item">
                        <FiUsers className="sidebar-icon" />
                        <span>Job Seekers</span>
                    </a>
                    <a href="/admin/jobs" className="sidebar-item">
                        <FiBriefcase className="sidebar-icon" />
                        <span>Jobs</span>
                    </a>
                    <a href="/admin/applications" className="sidebar-item">
                        <FiBarChart className="sidebar-icon" />
                        <span>Applications</span>
                    </a>
                    <a href="/admin/reports" className="sidebar-item">
                        <FiTrendingUp className="sidebar-icon" />
                        <span>Reports</span>
                    </a>
                    <a href="/admin/notifications" className="sidebar-item">
                        <FiBell className="sidebar-icon" />
                        <span>Notifications</span>
                        {stats.pendingJobs > 0 && (
                            <span className="sidebar-badge">{stats.pendingJobs}</span>
                        )}
                    </a>
                    <a href="/admin/feedback" className="sidebar-item">
                        <FiMessageSquare className="sidebar-icon" />
                        <span>Feedback</span>
                    </a>
                    <a href="/admin/fraud" className="sidebar-item">
                        <FiShield className="sidebar-icon" />
                        <span>Fraud Detection</span>
                    </a>
                    <a href="/admin/cms" className="sidebar-item">
                        <FiBookOpen className="sidebar-icon" />
                        <span>Content Management</span>
                    </a>
                    <a href="/admin/support" className="sidebar-item">
                        <FiHeadphones className="sidebar-icon" />
                        <span>Support & Communication</span>
                    </a>
                    <a href="/admin/settings" className="sidebar-item">
                        <FiSettings className="sidebar-icon" />
                        <span>System Settings</span>
                    </a>
                </aside>

                {/* Main Content Area */}
                <main className="account-content">
                    <div className="dashboard-grid">
                        <div className="metric-card">
                            <div className="metric-icon">
                                <FiUsers />
                            </div>
                            <div className="metric-content">
                                <h3>Total Users</h3>
                                <p className="metric-value">{stats.totalUsers}</p>
                                <p className="metric-subtext">
                                    {stats.totalEmployers} Employers, {stats.totalJobSeekers} Job Seekers
                                </p>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">
                                <FiBriefcase />
                            </div>
                            <div className="metric-content">
                                <h3>Active Jobs</h3>
                                <p className="metric-value">{stats.activeJobs}</p>
                                <p className="metric-subtext">
                                    {stats.pendingJobs} Pending Approval
                                </p>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">
                                <FiClock />
                            </div>
                            <div className="metric-content">
                                <h3>Pending Approvals</h3>
                                <p className="metric-value">{stats.pendingJobs}</p>
                                <p className="metric-subtext">
                                    Jobs awaiting review
                                </p>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">
                                <FiMessageSquare />
                            </div>
                            <div className="metric-content">
                                <h3>Feedback</h3>
                                <p className="metric-value">{stats.totalFeedback}</p>
                                <p className="metric-subtext">
                                    {stats.recentFeedback} New this week
                                </p>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">
                                <FiTrendingUp />
                            </div>
                            <div className="metric-content">
                                <h3>User Growth</h3>
                                <p className="metric-value">+{stats.userGrowth}%</p>
                                <p className="metric-subtext">
                                    This month
                                </p>
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-icon">
                                <FiTrendingUp />
                            </div>
                            <div className="metric-content">
                                <h3>Job Postings</h3>
                                <p className="metric-value">+{stats.jobGrowth}%</p>
                                <p className="metric-subtext">
                                    This month
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* AI Insights Section */}
                    <div className="dashboard-section">
                        <h2 className="section-title">AI Insights</h2>
                        <div className="dashboard-grid">
                            <div className="metric-card ai-card">
                                <div className="metric-icon">
                                    <FiTrendingUp />
                                </div>
                                <div className="metric-content">
                                    <h3>Predicted User Growth</h3>
                                    <p className="metric-value">+{aiInsights.predictedUserGrowth}%</p>
                                    <p className="metric-subtext">
                                        Next month prediction
                                    </p>
                                </div>
                            </div>

                            <div className="metric-card ai-card">
                                <div className="metric-icon">
                                    <FiBarChart />
                                </div>
                                <div className="metric-content">
                                    <h3>Trending Category</h3>
                                    <p className="metric-value">{aiInsights.trendingCategory}</p>
                                    <p className="metric-subtext">
                                        Most popular job category
                                    </p>
                                </div>
                            </div>

                            <div className="metric-card ai-card">
                                <div className="metric-icon">
                                    <FiActivity />
                                </div>
                                <div className="metric-content">
                                    <h3>User Engagement</h3>
                                    <p className="metric-value">{aiInsights.userEngagementScore}/100</p>
                                    <p className="metric-subtext">
                                        Overall engagement score
                                    </p>
                                </div>
                            </div>

                            <div className="metric-card ai-card">
                                <div className="metric-icon">
                                    <FiTarget />
                                </div>
                                <div className="metric-content">
                                    <h3>Anomaly Detection</h3>
                                    <p className="metric-value">{aiInsights.anomalyCount}</p>
                                    <p className="metric-subtext">
                                        Unusual activities detected
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-actions">
                        <button className="dashboard-btn" onClick={() => navigate('/admin/employers')}>
                            Manage Employers
                        </button>
                        <button className="dashboard-btn" onClick={() => navigate('/admin/jobseekers')}>
                            Manage Job Seekers
                        </button>
                        <button className="dashboard-btn" onClick={() => navigate('/admin/jobs')}>
                            Review Jobs
                        </button>
                        <button className="dashboard-btn" onClick={() => navigate('/admin/applications')}>
                            Manage Applications
                        </button>
                        <button className="dashboard-btn" onClick={() => navigate('/admin/reports')}>
                            View Reports
                        </button>
                        <button className="dashboard-btn" onClick={() => navigate('/admin/notifications')}>
                            View Notifications
                            {stats.pendingJobs > 0 && (
                                <span className="btn-badge">{stats.pendingJobs}</span>
                            )}
                        </button>
                        <button className="dashboard-btn" onClick={() => navigate('/admin/feedback')}>
                            Handle Feedback
                        </button>
                        <button className="dashboard-btn" onClick={() => navigate('/admin/fraud')}>
                            Monitor Fraud
                        </button>
                        <button className="dashboard-btn" onClick={() => navigate('/admin/cms')}>
                            Manage Content
                        </button>
                        <button className="dashboard-btn" onClick={() => navigate('/admin/support')}>
                            Support Center
                        </button>
                        <button className="dashboard-btn" onClick={() => navigate('/admin/settings')}>
                            System Settings
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AdminDashboard;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { FiMessageSquare, FiSend, FiMail, FiPhone, FiUser, FiSearch, FiFilter, FiLogOut, FiSun, FiMoon, FiHome, FiBell, FiHeadphones } from 'react-icons/fi';
import '../../styles/pages/Admin/AdminSupport.css';

function AdminSupport() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: 'all', // all, open, resolved, closed
        priority: 'all', // all, low, medium, high, urgent
        type: 'all', // all, complaint, inquiry, bug_report, feature_request
        dateFrom: '',
        dateTo: '',
        sortBy: 'created_at', // created_at, updated_at, priority
        sortOrder: 'desc' // asc, desc
    });
    const [showFilters, setShowFilters] = useState(false);
    const [showBulkEmail, setShowBulkEmail] = useState(false);
    const [selectedTickets, setSelectedTickets] = useState([]);
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
        const fetchTickets = async () => {
            try {
                const response = await api.getAdminSupportTickets();
                const ticketsData = Array.isArray(response.data) ? response.data : [];
                setTickets(ticketsData);
                setFilteredTickets(ticketsData);
            } catch (err) {
                setError(err.message || 'Failed to fetch support tickets');
                setTickets([]);
                setFilteredTickets([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    useEffect(() => {
        if (!Array.isArray(tickets)) {
            setFilteredTickets([]);
            return;
        }

        let filtered = tickets.filter(ticket => {
            // Search term filter
            const matchesSearch = !searchTerm ||
                ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (ticket.user && ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase()));

            // Status filter
            const matchesStatus = filters.status === 'all' || ticket.status === filters.status;

            // Priority filter
            const matchesPriority = filters.priority === 'all' || ticket.priority === filters.priority;

            // Type filter
            const matchesType = filters.type === 'all' || ticket.type === filters.type;

            // Date range filter
            const ticketDate = new Date(ticket.created_at);
            const matchesDateFrom = !filters.dateFrom || ticketDate >= new Date(filters.dateFrom);
            const matchesDateTo = !filters.dateTo || ticketDate <= new Date(filters.dateTo);

            return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesDateFrom && matchesDateTo;
        });

        // Sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (filters.sortBy) {
                case 'created_at':
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
                    break;
                case 'updated_at':
                    aValue = new Date(a.updated_at || a.created_at);
                    bValue = new Date(b.updated_at || b.created_at);
                    break;
                case 'priority':
                    const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3, 'urgent': 4 };
                    aValue = priorityOrder[a.priority] || 0;
                    bValue = priorityOrder[b.priority] || 0;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredTickets(filtered);
    }, [searchTerm, tickets, filters]);

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
            priority: 'all',
            type: 'all',
            dateFrom: '',
            dateTo: '',
            sortBy: 'created_at',
            sortOrder: 'desc'
        });
        setSearchTerm('');
    };

    const handleTicketSelect = (ticketId) => {
        setSelectedTickets(prev =>
            prev.includes(ticketId)
                ? prev.filter(id => id !== ticketId)
                : [...prev, ticketId]
        );
    };

    const handleSelectAll = () => {
        if (selectedTickets.length === filteredTickets.length) {
            setSelectedTickets([]);
        } else {
            setSelectedTickets(filteredTickets.map(ticket => ticket.id));
        }
    };

    const handleBulkStatusUpdate = async (status) => {
        if (selectedTickets.length === 0) return;

        try {
            await Promise.all(
                selectedTickets.map(ticketId =>
                    api.updateAdminSupportTicketStatus(ticketId, { status })
                )
            );

            // Update tickets in state
            setTickets(prevTickets =>
                prevTickets.map(ticket =>
                    selectedTickets.includes(ticket.id)
                        ? { ...ticket, status, updated_at: new Date().toISOString() }
                        : ticket
                )
            );

            setSelectedTickets([]);
        } catch (err) {
            console.error('Failed to update ticket statuses:', err);
        }
    };

    const handleSendBulkEmail = async (emailData) => {
        try {
            await api.sendAdminBulkEmail(emailData);
            setShowBulkEmail(false);
        } catch (err) {
            console.error('Failed to send bulk email:', err);
        }
    };

    const handleSendAnnouncement = async (announcementData) => {
        try {
            await api.sendAdminAnnouncement(announcementData);
        } catch (err) {
            console.error('Failed to send announcement:', err);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return '#dc2626';
            case 'high': return '#ea580c';
            case 'medium': return '#d97706';
            case 'low': return '#65a30d';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'open': return <FiMessageSquare className="status-icon open" />;
            case 'resolved': return <FiCheckCircle className="status-icon resolved" />;
            case 'closed': return <FiXCircle className="status-icon closed" />;
            default: return <FiMessageSquare className="status-icon" />;
        }
    };

    if (loading) return (
        <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading support tickets...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <FiHeadphones className="error-icon" />
            <p>Error: {error}</p>
        </div>
    );

    return (
        <div className={`admin-support ${theme}`}>
            <header className="admin-header">
                <h1>
                    <FiHeadphones className="header-icon" />
                    Support & Communication
                </h1>
                <div className="admin-header-actions">
                    <button className="bulk-email-button" onClick={() => setShowBulkEmail(true)}>
                        <FiMail /> Bulk Email
                    </button>
                    <button className="announcement-button" onClick={() => handleSendAnnouncement({ message: 'Test announcement' })}>
                        <FiSend /> Send Announcement
                    </button>
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
                <div className="support-summary">
                    <div className="summary-card">
                        <h3>Total Tickets</h3>
                        <p className="summary-value">{tickets.length}</p>
                    </div>
                    <div className="summary-card">
                        <h3>Open Tickets</h3>
                        <p className="summary-value">{tickets.filter(t => t.status === 'open').length}</p>
                    </div>
                    <div className="summary-card">
                        <h3>Resolved Today</h3>
                        <p className="summary-value">
                            {tickets.filter(t => t.status === 'resolved' && new Date(t.updated_at).toDateString() === new Date().toDateString()).length}
                        </p>
                    </div>
                    <div className="summary-card">
                        <h3>Urgent Tickets</h3>
                        <p className="summary-value">{tickets.filter(t => t.priority === 'urgent').length}</p>
                    </div>
                </div>

                <div className="search-filter-container">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
                        <FiFilter /> Advanced Filters
                    </button>
                    {(searchTerm || filters.status !== 'all' || filters.priority !== 'all' || filters.type !== 'all' || filters.dateFrom || filters.dateTo) && (
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
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Priority:</label>
                                <select
                                    value={filters.priority}
                                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                                >
                                    <option value="all">All Priority</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Type:</label>
                                <select
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    <option value="complaint">Complaint</option>
                                    <option value="inquiry">Inquiry</option>
                                    <option value="bug_report">Bug Report</option>
                                    <option value="feature_request">Feature Request</option>
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
                                    <option value="created_at">Created Date</option>
                                    <option value="updated_at">Updated Date</option>
                                    <option value="priority">Priority</option>
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

                {selectedTickets.length > 0 && (
                    <div className="bulk-actions">
                        <span>{selectedTickets.length} ticket(s) selected</span>
                        <div className="bulk-buttons">
                            <button
                                className="bulk-resolve-button"
                                onClick={() => handleBulkStatusUpdate('resolved')}
                            >
                                Mark as Resolved
                            </button>
                            <button
                                className="bulk-close-button"
                                onClick={() => handleBulkStatusUpdate('closed')}
                            >
                                Close Tickets
                            </button>
                        </div>
                    </div>
                )}

                <div className="tickets-list">
                    <table className="tickets-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th onClick={() => toggleSort('priority')} className="sortable-header">
                                    Priority {filters.sortBy === 'priority' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Subject</th>
                                <th>User</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th onClick={() => toggleSort('created_at')} className="sortable-header">
                                    Created {filters.sortBy === 'created_at' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th onClick={() => toggleSort('updated_at')} className="sortable-header">
                                    Updated {filters.sortBy === 'updated_at' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(filteredTickets) && filteredTickets.map(ticket => (
                                <tr key={ticket.id} className={`ticket-row priority-${ticket.priority}`}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedTickets.includes(ticket.id)}
                                            onChange={() => handleTicketSelect(ticket.id)}
                                        />
                                    </td>
                                    <td>
                                        <span
                                            className="priority-badge"
                                            style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                                        >
                                            {ticket.priority.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="ticket-subject">{ticket.subject}</td>
                                    <td>
                                        <div className="user-info">
                                            <FiUser className="user-icon" />
                                            {ticket.user ? ticket.user.name : 'Anonymous'}
                                        </div>
                                    </td>
                                    <td>{ticket.type.replace('_', ' ').toUpperCase()}</td>
                                    <td>
                                        <span className={`status-indicator status-${ticket.status}`}>
                                            {getStatusIcon(ticket.status)}
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                                    <td>{ticket.updated_at ? new Date(ticket.updated_at).toLocaleDateString() : 'Never'}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="view-button"
                                                onClick={() => navigate(`/admin/support/tickets/${ticket.id}`)}
                                                title="View Ticket"
                                            >
                                                View
                                            </button>
                                            {ticket.status === 'open' && (
                                                <button
                                                    className="resolve-button"
                                                    onClick={() => handleBulkStatusUpdate('resolved')}
                                                    title="Mark as Resolved"
                                                >
                                                    Resolve
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredTickets.length === 0 && (
                        <div className="no-tickets">
                            <FiHeadphones className="no-tickets-icon" />
                            <p>No support tickets found matching your criteria.</p>
                        </div>
                    )}
                </div>

                {/* Quick Communication Tools */}
                <div className="communication-tools">
                    <h2>Quick Communication</h2>
                    <div className="tools-grid">
                        <div className="tool-card">
                            <FiMail className="tool-icon" />
                            <h3>Bulk Email</h3>
                            <p>Send emails to multiple users</p>
                            <button className="tool-button" onClick={() => setShowBulkEmail(true)}>
                                Send Email
                            </button>
                        </div>
                        <div className="tool-card">
                            <FiSend className="tool-icon" />
                            <h3>System Announcement</h3>
                            <p>Broadcast important messages</p>
                            <button className="tool-button" onClick={() => handleSendAnnouncement({ message: 'System maintenance scheduled' })}>
                                Send Announcement
                            </button>
                        </div>
                        <div className="tool-card">
                            <FiPhone className="tool-icon" />
                            <h3>Emergency Contact</h3>
                            <p>Contact information for urgent issues</p>
                            <button className="tool-button">
                                View Contacts
                            </button>
                        </div>
                        <div className="tool-card">
                            <FiMessageSquare className="tool-icon" />
                            <h3>Response Templates</h3>
                            <p>Pre-written responses for common issues</p>
                            <button className="tool-button">
                                Manage Templates
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bulk Email Modal */}
            {showBulkEmail && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Send Bulk Email</h2>
                        <p>Bulk email functionality would be implemented here.</p>
                        <button onClick={() => setShowBulkEmail(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminSupport;
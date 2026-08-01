// Utility functions for the job portal application

// Date and time utilities
export const formatDate = (dateString, options = {}) => {
    if (!dateString) return 'N/A';

    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
    };

    return new Date(dateString).toLocaleDateString(undefined, defaultOptions);
};

export const formatRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';

    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return formatDate(dateString, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });
};

// String utilities
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str, maxLength = 100, suffix = '...') => {
    if (!str || str.length <= maxLength) return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
};

export const slugify = (str) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export const generateId = (prefix = 'id') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Array utilities
export const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
        const group = item[key];
        groups[group] = groups[group] || [];
        groups[group].push(item);
        return groups;
    }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });
};

export const unique = (array, key = null) => {
    if (!key) return [...new Set(array)];

    const seen = new Set();
    return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) return false;
        seen.add(value);
        return true;
    });
};

// Object utilities
export const pick = (obj, keys) => {
    return keys.reduce((result, key) => {
        if (key in obj) {
            result[key] = obj[key];
        }
        return result;
    }, {});
};

export const omit = (obj, keys) => {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
};

export const isEmpty = (obj) => {
    if (!obj) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
};

export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));

    const cloned = {};
    Object.keys(obj).forEach(key => {
        cloned[key] = deepClone(obj[key]);
    });
    return cloned;
};

// Validation utilities
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
};

export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// API utilities
export const createApiUrl = (endpoint, params = {}) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    const url = new URL(`${baseUrl}${endpoint}`);

    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
            url.searchParams.append(key, params[key]);
        }
    });

    return url.toString();
};

export const handleApiError = (error) => {
    if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;

        switch (status) {
            case 400:
                return { type: 'validation', message: data.message || 'Invalid request' };
            case 401:
                return { type: 'auth', message: 'Authentication required' };
            case 403:
                return { type: 'permission', message: 'Access denied' };
            case 404:
                return { type: 'not_found', message: 'Resource not found' };
            case 422:
                return { type: 'validation', message: data.message || 'Validation failed' };
            case 500:
                return { type: 'server', message: 'Server error' };
            default:
                return { type: 'unknown', message: data.message || 'An error occurred' };
        }
    } else if (error.request) {
        // Network error
        return { type: 'network', message: 'Network error. Please check your connection.' };
    } else {
        // Other error
        return { type: 'unknown', message: error.message || 'An unknown error occurred' };
    }
};

// File utilities
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
};

export const isValidFileType = (file, allowedTypes) => {
    if (!file || !allowedTypes) return false;
    const extension = getFileExtension(file.name);
    return allowedTypes.includes(extension);
};

// Local storage utilities
export const storage = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`Error reading from localStorage:`, error);
            return defaultValue;
        }
    },

    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn(`Error writing to localStorage:`, error);
            return false;
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn(`Error removing from localStorage:`, error);
            return false;
        }
    },

    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.warn(`Error clearing localStorage:`, error);
            return false;
        }
    }
};

// Debounce utility
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle utility
export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Animation utilities
export const animations = {
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    },

    slideIn: {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    },

    slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 }
    },

    scale: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 }
    }
};

// Theme utilities
export const themes = {
    light: {
        primary: '#667eea',
        secondary: '#764ba2',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1f2937',
        textSecondary: '#6b7280',
        border: '#e5e7eb'
    },

    dark: {
        primary: '#667eea',
        secondary: '#764ba2',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#94a3b8',
        border: '#334155'
    }
};

export const getTheme = (themeName = 'light') => {
    return themes[themeName] || themes.light;
};

// Accessibility utilities
export const a11y = {
    // Generate unique IDs for form elements
    generateId: (prefix = 'a11y') => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

    // Focus management
    focusElement: (element) => {
        if (element && element.focus) {
            element.focus();
        }
    },

    // Announce content to screen readers
    announce: (message, priority = 'polite') => {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';

        document.body.appendChild(announcement);
        announcement.textContent = message;

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
};

// Export all utilities
export default {
    formatDate,
    formatRelativeTime,
    formatTime,
    capitalize,
    truncate,
    slugify,
    generateId,
    groupBy,
    sortBy,
    unique,
    pick,
    omit,
    isEmpty,
    deepClone,
    isValidEmail,
    isValidPhone,
    isValidUrl,
    validatePassword,
    createApiUrl,
    handleApiError,
    formatFileSize,
    getFileExtension,
    isValidFileType,
    storage,
    debounce,
    throttle,
    animations,
    themes,
    getTheme,
    a11y
};
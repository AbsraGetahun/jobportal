import React, { lazy, Suspense } from 'react';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEdit, FiSave, FiDownload, FiTrash2, FiUser, FiMail, FiPhone, FiLock,
  FiBriefcase, FiSearch, FiBell, FiLogOut, FiSun, FiMoon, FiHome, FiSettings,
  FiBarChart2, FiHeart, FiActivity, FiCloud, FiShield, FiLink, FiInfo,
  FiCheckCircle, FiFile, FiAward, FiFolder, FiMessageSquare
} from 'react-icons/fi';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileCard from '../../components/JobSeeker/ProfileCard';
import SecurityForm from '../../components/JobSeeker/SecurityForm';
import AppliedJobList from '../../components/JobSeeker/AppliedJobList';
import ProfileCompletenessIndicator from '../../components/ProfileCompletenessIndicator';
import ResumeUpload from '../../components/JobSeeker/ResumeUpload';
import JobRecommendations from '../../components/JobSeeker/JobRecommendations';
import SkillsExperience from '../../components/JobSeeker/SkillsExperience';
import EducationHistory from '../../components/JobSeeker/EducationHistory';
import Portfolio from '../../components/JobSeeker/Portfolio';
import SavedJobs from '../../components/JobSeeker/SavedJobs';
import NotificationPreferences from '../../components/JobSeeker/NotificationPreferences';
import PrivacySettings from '../../components/JobSeeker/PrivacySettings';
import AccountStats from '../../components/JobSeeker/AccountStats';
import SocialMediaLinks from '../../components/JobSeeker/SocialMediaLinks';
import ContactInfo from '../../components/JobSeeker/ContactInfo';
import ActivityHistory from '../../components/JobSeeker/ActivityHistory';
import DownloadProfileData from '../../components/JobSeeker/DownloadProfileData';
import PremiumFeatures from '../../components/JobSeeker/PremiumFeatures';
import AccountVerification from '../../components/JobSeeker/AccountVerification';
import defaultProfile from '../../assets/man1.jpg';
import '../../styles/pages/JobSeeker/JobSeekerAccount.css';
import '../../styles/components/JobSeeker/JobSeekerAccountComponents.css';
import '../../styles/components/JobSeeker/EditableForm.css';
import '../../styles/components/JobSeeker/JobApplications.css';
import '../../styles/components/JobSeeker/ProfessionalBackground.css';
import '../../styles/components/JobSeeker/ResumeUpload.css';
import '../../styles/components/JobSeeker/JobRecommendationsSimple.css';
import '../../styles/components/JobSeeker/PremiumFeatures.css';
import '../../styles/components/JobSeeker/AccountSettings.css';
import '../../styles/components/JobSeeker/FeedbackSection.css';
import '../../styles/components/JobSeeker/AccountManagement.css';
import '../../styles/components/JobSeeker/AccountStatistics.css';
import '../../styles/components/JobSeeker/ResumeSection.css';
import api from '../../api';
import EditableForm from '../../components/JobSeeker/EditableForm';
import CollapsibleSection from '../../components/CollapsibleSection';
import FeedbackMessage from '../../components/FeedbackMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import FeedbackForm from '../../components/FeedbackForm';
import '../../styles/components/FeedbackForm.css';
// Helper function to split full name into first, middle, and last names
const splitName = (fullName) => {
    if (!fullName) {
        return { firstName: '', middleName: '', lastName: '' };
    }
    
    const parts = fullName.trim().split(/\s+/);
    
    if (parts.length === 0) {
        return { firstName: '', middleName: '', lastName: '' };
    }
    
    if (parts.length === 1) {
        return { firstName: parts[0], middleName: '', lastName: '' };
    }
    
    if (parts.length === 2) {
        return { firstName: parts[0], middleName: '', lastName: parts[1] };
    }
    
    // For names with more than 2 parts, treat the first as first name,
    // the last as last name, and everything in between as middle name
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    const middleName = parts.slice(1, -1).join(' ');
    
    return { firstName, middleName, lastName };
};

const JobSeekerAccount = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return savedTheme;
    });
    const [notificationCount, setNotificationCount] = useState(0);

    const [profile, setProfile] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Feedback and loading states
    const [feedbackMessage, setFeedbackMessage] = useState(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isUploadingResume, setIsUploadingResume] = useState(false);
    
    // Memoize pending jobs count to avoid recalculating on every render
    const pendingJobsCount = React.useMemo(() => {
        return appliedJobs.filter(job => job.status === 'pending').length;
    }, [appliedJobs]);

    // Active tab state (matching EmployerAccount structure)
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event) => {
            // Tab navigation with arrow keys
            if (event.altKey && event.key >= '1' && event.key <= '8') {
                event.preventDefault();
                const tabIndex = parseInt(event.key) - 1;
                const tabs = ['profile', 'applications', 'skills', 'resume', 'recommendations', 'premium', 'feedback', 'account'];
                if (tabs[tabIndex]) {
                    setActiveTab(tabs[tabIndex]);
                }
            }

            // Escape key to close feedback messages
            if (event.key === 'Escape' && feedbackMessage) {
                setFeedbackMessage(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [feedbackMessage]);

    // Fetch notification count
    useEffect(() => {
        const fetchNotificationCount = async () => {
            try {
                console.log('🔍 DEBUG: Fetching notification count...');
                const response = await api.getNotifications();
                console.log('✅ DEBUG: Notification API response:', response);
                console.log('📊 DEBUG: Notification response data:', response.data);
                const unreadCount = Array.isArray(response.data)
                    ? response.data.filter(notification => !notification.is_read).length
                    : 0;
                console.log('📈 DEBUG: Unread notification count:', unreadCount);
                setNotificationCount(unreadCount);
            } catch (error) {
                console.error('❌ Error fetching notification count:', error);

                // Handle different error types
                if (error.code === 'NETWORK_ERROR') {
                    console.warn('🌐 Network error - server may be down');
                    setNotificationCount(0); // Set safe default
                } else if (error.code === 'UNEXPECTED_ERROR') {
                    console.warn('💥 Unexpected error:', error.message);
                    setNotificationCount(0); // Set safe default
                } else if (error.error === 'Resource not found') {
                    console.warn('📭 No notifications found for user');
                    setNotificationCount(0); // This is actually normal for new users
                } else {
                    console.error('❌ Unhandled error:', error);
                }
            }
        };

        fetchNotificationCount();

        // Refresh notification count every 30 seconds
        const interval = setInterval(fetchNotificationCount, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let isMounted = true;

        // Check authentication status
        console.log('🔐 DEBUG: Checking authentication...');
        const token = localStorage.getItem('access_token');
        const user = localStorage.getItem('user');
        console.log('🔑 DEBUG: Access token exists:', !!token);
        console.log('👤 DEBUG: User data exists:', !!user);
        if (user) {
            try {
                const userData = JSON.parse(user);
                console.log('👤 DEBUG: User data:', userData);
            } catch (e) {
                console.error('❌ DEBUG: Failed to parse user data:', e);
            }
        }

        const fetchData = async () => {
            try {
                console.log('🔍 DEBUG: Fetching profile data...');
                // Fetch profile using the new endpoint
                const profileResponse = await api.getProfile();
                console.log('✅ DEBUG: Profile API response:', profileResponse);
                console.log('📊 DEBUG: Profile response data:', profileResponse.data);
                const profileData = profileResponse.data.data; // Adjusted to match backend response structure
                console.log('👤 DEBUG: Profile data extracted:', profileData);

                if (!isMounted) return;

                setProfile({
                                     // Split the name into first, middle, and last names
                                     ...splitName(profileData.name || ''),
                                      username: profileData.username || '',
                                      email: profileData.email,
                                      age: profileData.age || '',
                                      gender: profileData.gender || '',
                                      phone: profileData.phone || '',
                                      degree: profileData.degree || '',
                                      fieldOfStudy: profileData.fieldOfStudy || '',
                                      graduationYear: profileData.graduationYear || '',
                                      experience: profileData.experience || 0,
                                      profilePic: profileData.profile_picture || defaultProfile,
                                      resumeUrl: null,
                                      address: profileData.address || '',
                                      website: profileData.website || '',
                                      skills: profileData.skills || [],
                                      educationHistory: profileData.education || [],
                                      workExperience: profileData.work_experience || [],
                                      portfolio: profileData.portfolio || [],
                                      location: profileData.location || '',
                                      isVerified: profileData.is_verified || false
                                  });

                console.log('🔍 DEBUG: Fetching applications data...');
                // Fetch applications
                const jobsResponse = await api.getApplications();
                console.log('✅ DEBUG: Applications API response:', jobsResponse);
                console.log('📊 DEBUG: Applications response data:', jobsResponse.data);
                // Handle pagination response - response.data.data.data contains the actual array
                const applications = jobsResponse.data?.data?.data || jobsResponse.data?.data || jobsResponse.data || [];
                console.log('📋 DEBUG: Applications extracted:', applications);

                if (!isMounted) return;

                setAppliedJobs(Array.isArray(applications) ? applications.map(job => ({
                    id: job.id,
                    title: job.job?.title || 'No title',
                    company: job.job?.employer?.name || job.job?.company?.name || 'Unknown Company',
                    appliedDate: job.created_at,
                    status: job.status,
                    logo: null
                })) : []);
                console.log('✅ DEBUG: Data fetching completed successfully');

            } catch (err) {
                console.error('❌ Error fetching data:', err);

                // Handle different error types
                let errorMessage = 'Failed to fetch data';

                if (err.code === 'NETWORK_ERROR') {
                    errorMessage = 'Unable to connect to the server. Please check your internet connection.';
                    console.warn('🌐 Network error in fetchData');
                } else if (err.code === 'UNEXPECTED_ERROR') {
                    errorMessage = 'An unexpected error occurred. Please try again.';
                    console.warn('💥 Unexpected error in fetchData:', err.message);
                } else if (err.error === 'Resource not found') {
                    errorMessage = 'Some profile data could not be found. This may be normal for new accounts.';
                    console.warn('📭 Resource not found - may be normal for new users');
                } else if (err.message) {
                    errorMessage = err.message;
                }

                if (isMounted) {
                    setError(errorMessage);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        
        return () => {
            isMounted = false;
        };
    }, []);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        logout();
        navigate('/dashboard');
    };

    const handleViewNotifications = () => {
        // Navigate to the notifications page
        navigate('/notificationlist');
    };

    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleUpdateProfile = async (updatedData) => {
        console.log('🚀 STARTING PROFILE UPDATE PROCESS');
        setIsSavingProfile(true);
        setFeedbackMessage(null);

        try {
            // DEBUG: Log the incoming data
            console.log('🔍 DEBUG: handleUpdateProfile called with data:', updatedData);
            console.log('📱 DEBUG: Phone value from form:', updatedData.phone);

            // Prepare data for API call
            const formData = new FormData();

            // Helper function to convert string values to appropriate types
            const convertDataTypes = (data) => {
                return {
                    ...data,
                    experience: data.experience ? parseInt(data.experience, 10) : null,
                    age: data.age ? parseInt(data.age, 10) : null,
                    graduationYear: data.graduationYear ? parseInt(data.graduationYear, 10) : null,
                    employeesCount: data.employeesCount ? parseInt(data.employeesCount, 10) : null,
                    establishmentYear: data.establishmentYear ? parseInt(data.establishmentYear, 10) : null,
                };
            };

            // Convert data types
            const convertedData = convertDataTypes(updatedData);

            console.log('🔄 DEBUG: Converted data:', convertedData);
            console.log('📱 DEBUG: Phone value after conversion:', convertedData.phone);

            // Add text fields
            // Combine first, middle, and last names into a single 'name' field
            const fullName = [convertedData.firstName, convertedData.middleName, convertedData.lastName]
                .filter(name => name && name.trim() !== '')
                .join(' ');
            formData.append('name', fullName || '');
            formData.append('username', convertedData.username || '');

            // Only append phone if it has a value (not empty string)
            if (convertedData.phone && convertedData.phone.trim() !== '') {
                formData.append('phone', convertedData.phone.trim());
            } else {
                // Send null explicitly for empty phone to ensure it's set to NULL in database
                formData.append('phone', '');
            }
            formData.append('degree', convertedData.degree || '');
            formData.append('fieldOfStudy', convertedData.fieldOfStudy || '');
            formData.append('experience', convertedData.experience !== null ? convertedData.experience : '');
            formData.append('age', convertedData.age !== null ? convertedData.age : '');
            formData.append('gender', convertedData.gender || '');
            formData.append('location', convertedData.location || '');
            // Add address and website fields
            formData.append('address', convertedData.address || '');
            formData.append('website', convertedData.website || '');
            formData.append('graduationYear', convertedData.graduationYear !== null ? convertedData.graduationYear : '');

            // Add profile picture if it's a file
            if (convertedData.profilePic && convertedData.profilePic !== profile.profilePic) {
                // If it's a data URL (from file reader), convert it to a file
                if (typeof convertedData.profilePic === 'string' && convertedData.profilePic.startsWith('data:')) {
                    // This is a data URL, we need to convert it to a file
                    // Extract the base64 data
                    const base64Data = convertedData.profilePic.split(',')[1];
                    const byteString = atob(base64Data);
                    const mimeString = convertedData.profilePic.split(',')[0].split(':')[1].split(';')[0];
                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);
                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }
                    const blob = new Blob([ab], { type: mimeString });
                    const file = new File([blob], 'profile-pic.png', { type: mimeString });
                    formData.append('profile_picture', file);
                } else if (convertedData.profilePic instanceof File) {
                    // It's already a file object
                    formData.append('profile_picture', convertedData.profilePic);
                }
            }

            // Make API call to update profile
            // Log FormData contents properly
            const formDataLog = {};
            for (let [key, value] of formData.entries()) {
                formDataLog[key] = value;
            }
            console.log('📤 SENDING PROFILE UPDATE REQUEST WITH DATA:', formDataLog);

            // Also log the FormData object itself
            console.log('📦 FormData object:', formData);

            // Log the FormData entries directly
            console.log('📋 FormData entries:');
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}:`, value);
            }

            console.log('🔗 CALLING api.updateProfile...');
            const response = await api.updateProfile(formData);
            console.log('✅ PROFILE UPDATE API RESPONSE RECEIVED:', response);
            console.log('📊 RESPONSE DATA:', response.data);
            console.log('👤 UPDATED PROFILE DATA:', response.data.data);

            // Validate response structure
            if (!response.data || !response.data.data) {
                throw new Error('Invalid response structure from server');
            }

            // Update local state with response data
            const updatedProfile = response.data.data;
            console.log('🔄 UPDATING LOCAL STATE WITH:', updatedProfile);

            setProfile(prev => {
                const newProfile = {
                    ...prev,
                    ...splitName(updatedProfile.name || ''),
                    phone: updatedProfile.phone || '',
                    degree: updatedProfile.degree || '',
                    fieldOfStudy: updatedProfile.fieldOfStudy || '',
                    experience: updatedProfile.experience || 0,
                    age: updatedProfile.age || '',
                    gender: updatedProfile.gender || '',
                    address: updatedProfile.address || '',
                    website: updatedProfile.website || '',
                    location: updatedProfile.location || '',
                    profilePic: updatedProfile.profile_picture || prev.profilePic,
                    isVerified: updatedProfile.is_verified !== undefined ? updatedProfile.is_verified : prev.isVerified
                };
                console.log('📝 NEW PROFILE STATE:', newProfile);
                return newProfile;
            });

            console.log('✅ LOCAL STATE UPDATED SUCCESSFULLY');

            // Exit edit mode
            console.log('🔄 SETTING isEditing TO FALSE');
            setIsEditing(false);

            // Update last updated timestamp
            setLastUpdated(new Date());

            // Show success message
            setFeedbackMessage({
                type: 'success',
                message: 'Profile updated successfully!'
            });

            console.log('🎉 PROFILE UPDATE PROCESS COMPLETED SUCCESSFULLY');
            setIsSavingProfile(false);

        } catch (err) {
            console.error('❌ ERROR UPDATING PROFILE:', err);
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                stack: err.stack
            });

            let errorMessage = 'An error occurred while updating your profile. Please try again.';

            if (err.response) {
                // Server responded with error status
                console.error("📡 SERVER ERROR RESPONSE:", err.response);
                console.error("📡 RESPONSE DATA:", err.response.data);
                switch (err.response.status) {
                    case 400:
                        errorMessage = 'Invalid data provided. Please check your inputs and try again.';
                        break;
                    case 401:
                        errorMessage = 'Authentication failed. Please log in again.';
                        break;
                    case 403:
                        errorMessage = 'Access denied. You do not have permission to update your profile.';
                        break;
                    case 404:
                        errorMessage = 'Profile not found. Please try again or contact support.';
                        break;
                    case 422:
                        errorMessage = 'Validation failed. Please check your inputs and try again.';
                        break;
                    case 500:
                        errorMessage = 'Server error. Please try again later.';
                        break;
                    default:
                        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
                }
            } else if (err.request) {
                // Network error
                console.error("🌐 NETWORK ERROR:", err.request);
                errorMessage = 'Network error. Please check your connection and try again.';
            } else {
                // Other error
                console.error("❓ UNKNOWN ERROR:", err.message);
                errorMessage = err.message || 'An unknown error occurred';
            }

            setFeedbackMessage({
                type: 'error',
                message: errorMessage
            });

            console.log('🔄 SETTING isSavingProfile TO FALSE DUE TO ERROR');
            setIsSavingProfile(false);

            // Don't exit edit mode on error so user can try again
            console.log('⚠️  KEEPING EDIT MODE ACTIVE DUE TO ERROR');
        }
    };

    const handleResumeUpload = async (file) => {
        setIsUploadingResume(true);
        setFeedbackMessage(null);

        try {
            const formData = new FormData();
            formData.append('resume', file);

            // Make API call to upload resume
            // This would be implemented in the backend
            console.log('Resume uploaded:', file.name);

            // Update profile with resume URL
            setProfile(prev => ({
                ...prev,
                resumeUrl: URL.createObjectURL(file)
            }));

            setFeedbackMessage({
                type: 'success',
                message: 'Resume uploaded successfully!'
            });
            setIsUploadingResume(false);
        } catch (err) {
            console.error('Error uploading resume:', err);
            let errorMessage = 'An error occurred while uploading your resume. Please try again.';
            
            if (err.response) {
                // Server responded with error status
                switch (err.response.status) {
                    case 400:
                        errorMessage = 'Invalid file provided. Please check the file and try again.';
                        break;
                    case 401:
                        errorMessage = 'Authentication failed. Please log in again.';
                        break;
                    case 403:
                        errorMessage = 'Access denied. You do not have permission to upload a resume.';
                        break;
                    case 413:
                        errorMessage = 'File too large. Please upload a smaller file.';
                        break;
                    case 415:
                        errorMessage = 'Unsupported file type. Please upload a PDF or Word document.';
                        break;
                    case 500:
                        errorMessage = 'Server error. Please try again later.';
                        break;
                    default:
                        errorMessage = err.response.data?.message || 'An error occurred while uploading your resume.';
                }
            } else if (err.request) {
                // Network error
                errorMessage = 'Network error. Please check your connection and try again.';
            }
            
            setFeedbackMessage({
                type: 'error',
                message: errorMessage
            });
            setIsUploadingResume(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            // Show confirmation dialog
            const confirmDelete = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
            if (!confirmDelete) {
                setShowDeleteConfirm(false);
                return;
            }
            
            // Make API call to delete the account
            const response = await api.deleteProfile();
            console.log('Account deleted successfully', response);
            alert('Account deleted successfully');
            setShowDeleteConfirm(false);
            handleLogout();
        } catch (err) {
            console.error('Error deleting account:', err);
            let errorMessage = 'An error occurred while deleting your account. Please try again.';
            let shouldCloseDialog = true;
            
            if (err.response) {
                // Server responded with error status
                switch (err.response.status) {
                    case 401:
                        errorMessage = 'Authentication failed. Please log in again.';
                        break;
                    case 403:
                        errorMessage = 'Access denied. You do not have permission to delete your account.';
                        break;
                    case 404:
                        errorMessage = 'Account not found. Please try again or contact support.';
                        break;
                    case 409:
                        errorMessage = 'Account cannot be deleted due to existing applications or other dependencies.';
                        shouldCloseDialog = false;
                        break;
                    case 500:
                        errorMessage = 'Server error. Please try again later.';
                        break;
                    default:
                        errorMessage = err.response.data?.message || 'An error occurred while deleting your account.';
                }
            } else if (err.request) {
                // Network error
                errorMessage = 'Network error. Please check your connection and try again.';
            }
            
            alert('Error deleting account: ' + errorMessage);
            if (shouldCloseDialog) {
                setShowDeleteConfirm(false);
            }
        }
    };

    const statusColors = {
        'pending': '#3b82f6',
        'approved': '#10b981',
        'rejected': '#ef4444',
        'interview_scheduled': '#8b5cf6'
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Error Loading Profile</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="error-container">
                <h2>No Profile Data Found</h2>
                <p>We couldn't find your profile data. Please try refreshing the page.</p>
                <button onClick={() => window.location.reload()}>Refresh</button>
            </div>
        );
    }

    return (
        <div className={`job-seeker-account ${theme}`} role="main">
            <a href="#main-content" className="sr-only">Skip to main content</a>

            {/* Feedback Messages */}
            {feedbackMessage && (
                <FeedbackMessage
                    type={feedbackMessage.type}
                    message={feedbackMessage.message}
                    onClose={() => setFeedbackMessage(null)}
                />
            )}

            {/* Keyboard Shortcuts Help */}
            <div className="keyboard-shortcuts-help">
                <div className="shortcuts-tooltip">
                    <strong>Keyboard Shortcuts:</strong>
                    <br />Alt + 1-8: Switch tabs
                    <br />Esc: Close messages
                </div>
            </div>
            {/* Header - unchanged */}
            <motion.header
                className={`careerplus__header ${scrolled ? 'scrolled' : ''}`}
                initial={{ backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}
                animate={{
                    backgroundColor: scrolled
                        ? (theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)')
                        : (theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)')
                }}
                transition={{ duration: 0.3 }}
                role="banner"
            >
                <div className="careerplus__header-container">
                    <motion.h1
                        className="careerplus__logo"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        CareerPlus
                    </motion.h1>
                    <nav className="careerplus__nav" role="navigation" aria-label="Main navigation">
                        <button className="careerplus__nav-icon" title="Home" onClick={() => navigate('/')} aria-label="Go to home page">
                            <FiHome />
                        </button>
                        <button className="careerplus__nav-icon" title="Search Jobs" onClick={() => navigate('/jobsearch')} aria-label="Search for jobs">
                            <FiSearch />
                        </button>
                        <button className="careerplus__nav-icon" title="Notifications" onClick={handleViewNotifications} aria-label="View notifications">
                            <FiBell />
                            {(notificationCount > 0 || pendingJobsCount > 0) && (
                                <span className="notification-badge" aria-label={`${notificationCount + pendingJobsCount} notifications`}>
                                    {notificationCount + pendingJobsCount}
                                </span>
                            )}
                        </button>
                        <button className="careerplus__nav-icon" title="Logout" onClick={handleLogout} aria-label="Logout">
                            <FiLogOut />
                        </button>
                        <button
                            className="careerplus__theme-toggle"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                        >
                            {theme === 'light' ? <FiMoon /> : <FiSun />}
                        </button>
                    </nav>
                </div>
            </motion.header>

            {/* Main Content Wrapper */}
            <div className="account-container">
            {/* Sidebar Navigation */}
            <div className="account-sidebar">
                <Link
                    to="#"
                    className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <span className="sidebar-icon"><FiUser /></span>
                    <span>Profile</span>
                </Link>
                <Link
                    to="#"
                    className={`sidebar-item ${activeTab === 'applications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('applications')}
                >
                    <span className="sidebar-icon"><FiBriefcase /></span>
                    <span>Applications</span>
                </Link>
                <Link
                    to="#"
                    className={`sidebar-item ${activeTab === 'skills' ? 'active' : ''}`}
                    onClick={() => setActiveTab('skills')}
                >
                    <span className="sidebar-icon"><FiAward /></span>
                    <span>Skills & Experience</span>
                </Link>
                <Link
                    to="#"
                    className={`sidebar-item ${activeTab === 'resume' ? 'active' : ''}`}
                    onClick={() => setActiveTab('resume')}
                >
                    <span className="sidebar-icon"><FiFile /></span>
                    <span>Resume</span>
                </Link>
                <Link
                    to="#"
                    className={`sidebar-item ${activeTab === 'recommendations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recommendations')}
                >
                    <span className="sidebar-icon"><FiSearch /></span>
                    <span>Recommendations</span>
                </Link>
                <Link
                    to="#"
                    className={`sidebar-item ${activeTab === 'premium' ? 'active' : ''}`}
                    onClick={() => setActiveTab('premium')}
                >
                    <span className="sidebar-icon"><FiCloud /></span>
                    <span>Premium Features</span>
                </Link>
                <Link
                    to="#"
                    className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    <span className="sidebar-icon"><FiSettings /></span>
                    <span>Settings</span>
                </Link>
                <Link
                    to="#"
                    className={`sidebar-item ${activeTab === 'feedback' ? 'active' : ''}`}
                    onClick={() => setActiveTab('feedback')}
                >
                    <span className="sidebar-icon"><FiMessageSquare /></span>
                    <span>Feedback</span>
                </Link>
                <Link
                    to="#"
                    className={`sidebar-item ${activeTab === 'account' ? 'active' : ''}`}
                    onClick={() => setActiveTab('account')}
                >
                    <span className="sidebar-icon"><FiLock /></span>
                    <span>Account</span>
                </Link>
                <Link
                    to="#"
                    className={`sidebar-item ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    <span className="sidebar-icon"><FiBarChart2 /></span>
                    <span>Statistics</span>
                </Link>
            </div>

                {/* Main Content */}
                <div className="account-content" id="main-content">
                    {/* Profile Section */}
                    {activeTab === 'profile' && (
                        <section className="profile-section">
                            <h2>Profile Summary</h2>
                            <div className="profile-content">
                                {/* Verification Status */}
                                {profile.isVerified ? (
                                    <div className="verification-status-section" style={{
                                        padding: '15px',
                                        marginBottom: '20px',
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <FiCheckCircle size={24} />
                                        <div>
                                            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>Account Verified</h3>
                                            <p style={{ margin: '0', opacity: '0.9', fontSize: '0.9rem' }}>
                                                Your account has been verified by our administrators. You can now apply to jobs and receive application updates.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="verification-status-section" style={{
                                        padding: '15px',
                                        marginBottom: '20px',
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <FiCheckCircle size={24} />
                                        <div>
                                            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>Verification Pending</h3>
                                            <p style={{ margin: '0', opacity: '0.9', fontSize: '0.9rem' }}>
                                                Your account is pending verification by our administrators. Complete your profile to speed up the process.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <ProfileCard
                                    profile={profile}
                                    isEditing={false}
                                    onEditToggle={() => setActiveTab('account')}
                                />
                                <ProfileCompletenessIndicator profile={profile} userType="jobseeker" />

                                <div className="profile-actions">
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="edit-profile-btn"
                                        onClick={() => setActiveTab('account')}
                                    >
                                        Edit Profile
                                    </motion.button>
                                </div>
                            </div>
                        </section>
                    )}
                    
                    {/* Applications Section */}
                    {activeTab === 'applications' && (
                        <section className="job-applications-section">
                            <h2>My Job Applications</h2>
                            <div className="applications-content">
                                <div className="applied-jobs">
                                    <h3>Applied Jobs</h3>
                                    {appliedJobs.length > 0 ? (
                                        appliedJobs.map((job, index) => (
                                            <div key={job.id || index} className={`job-application-card ${job.status?.toLowerCase() || 'pending'}`}>
                                                <span className="job-title">{job.title || 'Unknown Job'}</span>
                                                <span className="company-name">{job.company || 'Unknown Company'}</span>
                                                <div className="application-meta">
                                                    <div className="meta-item">
                                                        <span className="meta-label">Applied</span>
                                                        <span className="meta-value">{job.appliedDate ? new Date(job.appliedDate).toLocaleDateString() : 'Not specified'}</span>
                                                    </div>
                                                    <div className="meta-item">
                                                        <span className="meta-label">Status</span>
                                                        <span className={`status-badge ${job.status?.toLowerCase() || 'pending'}`}>
                                                            {job.status || 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-applications">
                                            <div className="empty-icon">📋</div>
                                            <h4>No Applications Yet</h4>
                                            <p>You haven't applied to any jobs yet. Start exploring opportunities and submit your first application!</p>
                                        </div>
                                    )}
                                </div>
                                <div className="saved-jobs">
                                    <h3>Saved Jobs</h3>
                                    {/* Mock saved jobs data for demonstration */}
                                    <div className="saved-job-card">
                                        <div className="saved-job-header">
                                            <div className="saved-job-info">
                                                <span className="job-title">C</span>
                                                <span className="company-name">Unknown Company</span>
                                                <div className="application-meta">
                                                    <div className="meta-item">
                                                        <span className="meta-label">Location</span>
                                                        <span className="meta-value">Not specified</span>
                                                    </div>
                                                    <div className="meta-item">
                                                        <span className="meta-label">Type</span>
                                                        <span className="meta-value">Not specified</span>
                                                    </div>
                                                    <div className="meta-item">
                                                        <span className="meta-label">Salary</span>
                                                        <span className="meta-value">Not specified</span>
                                                    </div>
                                                    <div className="meta-item">
                                                        <span className="meta-label">Saved</span>
                                                        <span className="meta-value">9/2/2025</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="saved-job-actions">
                                                <button className="btn-view-details">View Details</button>
                                                <button className="btn-apply-now">Apply Now</button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Additional saved jobs can be added here */}
                                </div>
                            </div>
                        </section>
                    )}
                    
                    {/* Skills & Experience Section */}
                    {activeTab === 'skills' && (
                        <section className="professional-background-section">
                            <h2>Professional Background</h2>
                            <div className="skills-content">
                                <div className="collapsible-section">
                                    <div className="collapsible-header" onClick={() => {/* toggle logic */}}>
                                        <div className="collapsible-header-content">
                                            <div className="section-icon skills">🎯</div>
                                            <div className="section-info">
                                                <h3>Skills & Work Experience</h3>
                                                <p className="section-description">Showcase your professional skills and work experience</p>
                                            </div>
                                        </div>
                                        <button className="collapsible-toggle">Edit</button>
                                    </div>
                                    <div className="collapsible-content expanded">
                                        <div className="skills-section">
                                            <div className="skills-grid">
                                                {profile.skills && profile.skills.length > 0 ? (
                                                    profile.skills.map((skill, index) => (
                                                        <div key={index} className="skill-item">
                                                            <div className="skill-name">{skill.name || 'Skill Name'}</div>
                                                            <div className="skill-level">Level: {skill.level || 'Intermediate'}</div>
                                                            <div className="skill-progress">
                                                                <div
                                                                    className="skill-progress-bar"
                                                                    style={{ width: `${skill.level === 'Expert' ? 100 : skill.level === 'Advanced' ? 75 : skill.level === 'Intermediate' ? 50 : 25}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="empty-state">
                                                        <div className="empty-state-icon">🎯</div>
                                                        <h4>No skills added yet</h4>
                                                        <p>Add your professional skills to showcase your expertise to potential employers.</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="work-experience-section">
                                                {profile.workExperience && profile.workExperience.length > 0 ? (
                                                    profile.workExperience.map((exp, index) => (
                                                        <div key={index} className="experience-item">
                                                            <div className="experience-header">
                                                                <div>
                                                                    <h4 className="experience-title">{exp.position || 'Position Title'}</h4>
                                                                    <p className="experience-company">{exp.company || 'Company Name'}</p>
                                                                    <span className="experience-duration">
                                                                        {exp.startDate ? new Date(exp.startDate).getFullYear() : '2020'} - {exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <p className="experience-description">{exp.description || 'Job description and responsibilities...'}</p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="empty-state">
                                                        <div className="empty-state-icon">💼</div>
                                                        <h4>No work experience added yet</h4>
                                                        <p>Add your work experience to demonstrate your professional background.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="collapsible-section">
                                    <div className="collapsible-header" onClick={() => {/* toggle logic */}}>
                                        <div className="collapsible-header-content">
                                            <div className="section-icon education">🎓</div>
                                            <div className="section-info">
                                                <h3>Education History</h3>
                                                <p className="section-description">Showcase your educational background and qualifications</p>
                                            </div>
                                        </div>
                                        <button className="collapsible-toggle">Edit</button>
                                    </div>
                                    <div className="collapsible-content expanded">
                                        <div className="education-section">
                                            {profile.educationHistory && profile.educationHistory.length > 0 ? (
                                                profile.educationHistory.map((edu, index) => (
                                                    <div key={index} className="education-item">
                                                        <div className="education-degree">{edu.degree || 'Degree Name'}</div>
                                                        <div className="education-institution">{edu.institution || 'Institution Name'}</div>
                                                        <div className="education-meta">
                                                            <span className="education-field">{edu.fieldOfStudy || 'Field of Study'}</span>
                                                            <span className="education-year">{edu.graduationYear || 'Year'}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="empty-state">
                                                    <div className="empty-state-icon">🎓</div>
                                                    <h4>No education history added yet</h4>
                                                    <p>Add your educational background to showcase your qualifications.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="collapsible-section">
                                    <div className="collapsible-header" onClick={() => {/* toggle logic */}}>
                                        <div className="collapsible-header-content">
                                            <div className="section-icon portfolio">🚀</div>
                                            <div className="section-info">
                                                <h3>Portfolio & Projects</h3>
                                                <p className="section-description">Showcase your work and projects to potential employers</p>
                                            </div>
                                        </div>
                                        <button className="collapsible-toggle">Edit</button>
                                    </div>
                                    <div className="collapsible-content expanded">
                                        <div className="portfolio-section">
                                            <div className="portfolio-grid">
                                                {profile.portfolio && profile.portfolio.length > 0 ? (
                                                    profile.portfolio.map((project, index) => (
                                                        <div key={index} className="portfolio-item">
                                                            <div className="portfolio-image">📁</div>
                                                            <div className="portfolio-title">{project.title || 'Project Title'}</div>
                                                            <div className="portfolio-description">{project.description || 'Project description...'}</div>
                                                            <div className="portfolio-tags">
                                                                {project.technologies && project.technologies.map((tech, techIndex) => (
                                                                    <span key={techIndex} className="portfolio-tag">{tech}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="empty-state">
                                                        <div className="empty-state-icon">🚀</div>
                                                        <h4>No projects added yet</h4>
                                                        <p>Showcase your work and projects to stand out to potential employers.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                    
                    {/* Resume Section */}
                    {activeTab === 'resume' && (
                        <section className="resume-section">
                            <h2>Resume</h2>
                            <div className="resume-content">
                                {/* Resume Upload Card */}
                                <div className="resume-upload-card">
                                    <div className="resume-upload-area">
                                        <input
                                            type="file"
                                            className="file-input"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    handleResumeUpload(file);
                                                }
                                            }}
                                        />
                                        <div className="upload-icon">📄</div>
                                        <div className="upload-text">
                                            <div className="no-file-text">No file chosen</div>
                                            <div className="click-to-select">Click to select file</div>
                                            <div className="upload-instructions">
                                                Upload your resume in PDF, DOC, or DOCX format (max 5MB)
                                            </div>
                                        </div>
                                    </div>

                                    <div className="supported-formats">
                                        Supported formats: PDF, DOC, DOCX • Max size: 5MB
                                    </div>

                                    <button type="button" className="upload-button">
                                        Upload Resume
                                    </button>
                                </div>

                                {/* Resume Tips */}
                                <div className="resume-tips">
                                    <h4>Resume Tips</h4>
                                    <div className="resume-tips-list">
                                        <div className="resume-tip">
                                            Use a clean, professional format with clear headings
                                        </div>
                                        <div className="resume-tip">
                                            Include relevant keywords from job descriptions
                                        </div>
                                        <div className="resume-tip">
                                            Quantify your achievements with numbers and metrics
                                        </div>
                                        <div className="resume-tip">
                                            Keep it to 1-2 pages for most positions
                                        </div>
                                        <div className="resume-tip">
                                            Proofread carefully for spelling and grammar
                                        </div>
                                        <div className="resume-tip">
                                            Use action verbs to describe your experience
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Recommendations Section */}
                    {activeTab === 'recommendations' && (
                        <section className="job-recommendations-section">
                            <h2>Job Recommendations</h2>
                            <div className="recommendations-content">
                                <div className="recommended-jobs">
                                    <h3>Recommended Jobs</h3>
                                    <div className="recommendation-item">
                                        <div className="recommendation-header">
                                            <span className="job-title">Senior Software Developer</span>
                                            <span className="company-name">TechCorp Inc.</span>
                                        </div>
                                        <div className="recommendation-details">
                                            <div className="detail-row">
                                                <span className="detail-label">Location</span>
                                                <span className="detail-value">Addis Ababa, Ethiopia</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Salary</span>
                                                <span className="detail-value">$50,000 - $70,000</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Type</span>
                                                <span className="detail-value">Full-time</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Level</span>
                                                <span className="detail-value">Senior</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Match</span>
                                                <span className="match-score high">95% Match</span>
                                            </div>
                                        </div>
                                        <div className="recommendation-actions">
                                            <button className="btn-apply-now">Apply Now</button>
                                            <button className="btn-save-job">Save Job</button>
                                            <button className="btn-view-details">View Details</button>
                                        </div>
                                    </div>

                                    <div className="recommendation-item">
                                        <div className="recommendation-header">
                                            <span className="job-title">Frontend Developer</span>
                                            <span className="company-name">StartupXYZ</span>
                                        </div>
                                        <div className="recommendation-details">
                                            <div className="detail-row">
                                                <span className="detail-label">Location</span>
                                                <span className="detail-value">Remote</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Salary</span>
                                                <span className="detail-value">$40,000 - $55,000</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Type</span>
                                                <span className="detail-value">Full-time</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Level</span>
                                                <span className="detail-value">Mid-level</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Match</span>
                                                <span className="match-score medium">82% Match</span>
                                            </div>
                                        </div>
                                        <div className="recommendation-actions">
                                            <button className="btn-apply-now">Apply Now</button>
                                            <button className="btn-save-job">Save Job</button>
                                            <button className="btn-view-details">View Details</button>
                                        </div>
                                    </div>

                                    <div className="recommendation-item">
                                        <div className="recommendation-header">
                                            <span className="job-title">Junior Web Developer</span>
                                            <span className="company-name">Digital Solutions Ltd</span>
                                        </div>
                                        <div className="recommendation-details">
                                            <div className="detail-row">
                                                <span className="detail-label">Location</span>
                                                <span className="detail-value">Dire Dawa, Ethiopia</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Salary</span>
                                                <span className="detail-value">$25,000 - $35,000</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Type</span>
                                                <span className="detail-value">Full-time</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Level</span>
                                                <span className="detail-value">Entry-level</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Match</span>
                                                <span className="match-score low">68% Match</span>
                                            </div>
                                        </div>
                                        <div className="recommendation-actions">
                                            <button className="btn-apply-now">Apply Now</button>
                                            <button className="btn-save-job saved">Saved</button>
                                            <button className="btn-view-details">View Details</button>
                                        </div>
                                    </div>

                                    <div className="recommendation-item">
                                        <div className="recommendation-header">
                                            <span className="job-title">Full Stack Developer</span>
                                            <span className="company-name">InnovateTech</span>
                                        </div>
                                        <div className="recommendation-details">
                                            <div className="detail-row">
                                                <span className="detail-label">Location</span>
                                                <span className="detail-value">Hawassa, Ethiopia</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Salary</span>
                                                <span className="detail-value">$45,000 - $60,000</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Type</span>
                                                <span className="detail-value">Full-time</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Level</span>
                                                <span className="detail-value">Mid-level</span>
                                            </div>
                                            <div className="detail-row">
                                                <span className="detail-label">Match</span>
                                                <span className="match-score high">91% Match</span>
                                            </div>
                                        </div>
                                        <div className="recommendation-actions">
                                            <button className="btn-apply-now" disabled>Applied</button>
                                            <button className="btn-save-job">Save Job</button>
                                            <button className="btn-view-details">View Details</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                    
                    {/* Premium Features Section */}
                    {activeTab === 'premium' && (
                        <section className="premium-features-section">
                            <h2>Premium Features</h2>
                            <div className="premium-features-content">
                                {/* Header Section */}
                                <div className="premium-header">
                                    <h3>Premium Account Features</h3>
                                    <p>Upgrade your account to unlock powerful job search tools</p>
                                </div>

                                {/* Current Plan Section */}
                                <div className="current-plan-section">
                                    <div className="current-plan-header">
                                        <h3 className="current-plan-title">Basic Plan</h3>
                                        <span className="current-plan-badge">Current Plan</span>
                                    </div>
                                    <p>Current Plan Features</p>
                                    <div className="current-plan-features">
                                        <div className="feature-item">Profile completeness indicator</div>
                                        <div className="feature-item">Basic job recommendations</div>
                                        <div className="feature-item">Application history tracking</div>
                                        <div className="feature-item">Standard notification settings</div>
                                        <div className="feature-item">Basic privacy controls</div>
                                    </div>
                                    <div className="upgrade-prompt">
                                        <p>Upgrade to unlock premium features and accelerate your job search</p>
                                    </div>
                                </div>

                                {/* Pricing Plans */}
                                <div className="pricing-plans">
                                    {/* Basic Plan */}
                                    <div className="pricing-card current">
                                        <div className="pricing-header">
                                            <h4 className="pricing-name">Basic</h4>
                                            <p className="pricing-description">Essential features for job seekers</p>
                                        </div>
                                        <div className="pricing-price">
                                            <span className="price-amount">$9.99</span>
                                            <span className="price-period">/month</span>
                                        </div>
                                        <div className="pricing-features">
                                            <h4>Features</h4>
                                            <div className="pricing-feature">5 job applications per month</div>
                                            <div className="pricing-feature">Basic job alerts</div>
                                            <div className="pricing-feature">Profile visibility to employers</div>
                                            <div className="pricing-feature">Access to company reviews</div>
                                        </div>
                                        <button className="pricing-button">Current Plan</button>
                                    </div>

                                    {/* Professional Plan */}
                                    <div className="pricing-card popular">
                                        <div className="pricing-header">
                                            <h4 className="pricing-name">Professional</h4>
                                            <p className="pricing-description">Advanced tools for serious job seekers</p>
                                        </div>
                                        <div className="pricing-price">
                                            <span className="price-amount">$19.99</span>
                                            <span className="price-period">/month</span>
                                        </div>
                                        <div className="pricing-features">
                                            <h4>Features</h4>
                                            <div className="pricing-feature">Unlimited job applications</div>
                                            <div className="pricing-feature">Priority job alerts</div>
                                            <div className="pricing-feature">Enhanced profile visibility</div>
                                            <div className="pricing-feature">Access to salary insights</div>
                                            <div className="pricing-feature">Application tracking</div>
                                            <div className="pricing-feature">Resume review suggestions</div>
                                            <div className="pricing-feature highlight">1 premium course per month</div>
                                        </div>
                                        <button className="pricing-button">Upgrade to Professional</button>
                                    </div>

                                    {/* Premium Plan */}
                                    <div className="pricing-card">
                                        <div className="pricing-header">
                                            <h4 className="pricing-name">Premium</h4>
                                            <p className="pricing-description">Complete job search solution</p>
                                        </div>
                                        <div className="pricing-price">
                                            <span className="price-amount">$29.99</span>
                                            <span className="price-period">/month</span>
                                        </div>
                                        <div className="pricing-features">
                                            <h4>Features</h4>
                                            <div className="pricing-feature">Unlimited job applications</div>
                                            <div className="pricing-feature">Real-time job alerts</div>
                                            <div className="pricing-feature">Top profile visibility</div>
                                            <div className="pricing-feature">Personalized salary insights</div>
                                            <div className="pricing-feature">Advanced application tracking</div>
                                            <div className="pricing-feature highlight">AI-powered resume optimization</div>
                                            <div className="pricing-feature highlight">Unlimited premium courses</div>
                                            <div className="pricing-feature highlight">1-on-1 career coaching session/month</div>
                                            <div className="pricing-feature highlight">Priority customer support</div>
                                        </div>
                                        <button className="pricing-button">Upgrade to Premium</button>
                                    </div>
                                </div>

                                {/* Monthly/Annual Toggle */}
                                <div className="pricing-toggle">
                                    <span>Monthly</span>
                                    <div className="toggle-switch">
                                        <span className="annual-badge">Annual Save 20%</span>
                                    </div>
                                </div>

                                {/* Premium Benefits */}
                                <div className="premium-benefits">
                                    <div className="benefits-header">
                                        <h3>Premium Benefits</h3>
                                    </div>
                                    <div className="benefits-grid">
                                        <div className="benefit-card">
                                            <span className="benefit-icon">⚡</span>
                                            <h4 className="benefit-title">Faster Applications</h4>
                                            <p className="benefit-description">Apply to jobs 3x faster with our one-click application feature</p>
                                        </div>
                                        <div className="benefit-card">
                                            <span className="benefit-icon">💰</span>
                                            <h4 className="benefit-title">Salary Insights</h4>
                                            <p className="benefit-description">Get real-time salary data for your target positions</p>
                                        </div>
                                        <div className="benefit-card">
                                            <span className="benefit-icon">🎯</span>
                                            <h4 className="benefit-title">Priority Matching</h4>
                                            <p className="benefit-description">Get matched with jobs before they're publicly available</p>
                                        </div>
                                        <div className="benefit-card">
                                            <span className="benefit-icon">🤖</span>
                                            <h4 className="benefit-title">AI Resume Review</h4>
                                            <p className="benefit-description">Get instant feedback on your resume from our AI</p>
                                        </div>
                                        <div className="benefit-card">
                                            <span className="benefit-icon">📚</span>
                                            <h4 className="benefit-title">Premium Courses</h4>
                                            <p className="benefit-description">Access to exclusive career development courses</p>
                                        </div>
                                        <div className="benefit-card">
                                            <span className="benefit-icon">🎧</span>
                                            <h4 className="benefit-title">Priority Support</h4>
                                            <p className="benefit-description">24/7 dedicated support with 1-hour response time</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Testimonials */}
                                <div className="testimonials-section">
                                    <div className="testimonials-header">
                                        <h3>What Our Premium Users Say</h3>
                                    </div>
                                    <div className="testimonials-grid">
                                        <div className="testimonial-card">
                                            <p className="testimonial-quote">"Upgrading to Premium helped me land my dream job 2 months faster than I expected!"</p>
                                            <div className="testimonial-author">
                                                <div className="author-avatar">S</div>
                                                <div className="author-info">
                                                    <h4>Sarah Johnson</h4>
                                                    <p>Software Engineer</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="testimonial-card">
                                            <p className="testimonial-quote">"The AI resume review saved me countless hours. My application success rate increased by 60%!"</p>
                                            <div className="testimonial-author">
                                                <div className="author-avatar">M</div>
                                                <div className="author-info">
                                                    <h4>Michael Chen</h4>
                                                    <p>Marketing Manager</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Feedback Section */}
                    {activeTab === 'feedback' && (
                        <section className="feedback-section">
                            <h2>Help & Feedback</h2>
                            <div className="feedback-content">
                                {/* Feedback Form Card */}
                                <div className="feedback-card">
                                    <div className="feedback-header">
                                        <h3 className="feedback-title">Share Your Feedback</h3>
                                        <p className="feedback-description">
                                            Help us improve by sharing your thoughts, suggestions, or reporting issues.
                                        </p>
                                    </div>

                                    <form className="feedback-form">
                                        <div className="form-group">
                                            <label className="form-label">
                                                Subject <span className="required-asterisk">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Brief description of your feedback"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Email <span className="optional-text">(Optional)</span>
                                            </label>
                                            <input
                                                type="email"
                                                className="form-input"
                                                placeholder="your.email@example.com"
                                            />
                                            <small className="form-description">
                                                We'll use this to follow up if needed
                                            </small>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">
                                                Message <span className="required-asterisk">*</span>
                                            </label>
                                            <textarea
                                                className="form-textarea"
                                                placeholder="Please provide detailed feedback..."
                                                rows="5"
                                                required
                                            ></textarea>
                                        </div>

                                        <div className="submit-section">
                                            <button type="submit" className="submit-button">
                                                Send Feedback
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Additional Help Links */}
                                <div className="help-links">
                                    <h4>Need Help?</h4>
                                    <div className="help-links-grid">
                                        <a href="#" className="help-link">
                                            <span className="help-link-icon">📞</span>
                                            <div className="help-link-content">
                                                <h5>Contact Support</h5>
                                                <p>Get help from our support team</p>
                                            </div>
                                        </a>

                                        <a href="#" className="help-link">
                                            <span className="help-link-icon">📚</span>
                                            <div className="help-link-content">
                                                <h5>Help Center</h5>
                                                <p>Browse our knowledge base</p>
                                            </div>
                                        </a>

                                        <a href="#" className="help-link">
                                            <span className="help-link-icon">💬</span>
                                            <div className="help-link-content">
                                                <h5>Community Forum</h5>
                                                <p>Connect with other users</p>
                                            </div>
                                        </a>

                                        <a href="#" className="help-link">
                                            <span className="help-link-icon">📧</span>
                                            <div className="help-link-content">
                                                <h5>Email Us</h5>
                                                <p>Send us an email directly</p>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                    
                    {/* Settings Section */}
                    {activeTab === 'settings' && (
                        <section className="account-settings-section">
                            <h2>Account Settings</h2>
                            <div className="settings-content">
                                {/* Notification Preferences */}
                                <div className="settings-card">
                                    <div className="settings-section-header">
                                        <h3 className="settings-section-title">🔔 Notification Preferences</h3>
                                        <p className="settings-section-description">Choose how you want to be notified about job opportunities and account activity</p>
                                    </div>

                                    <div className="notification-methods">
                                        <h4 className="methods-title">Notification Methods</h4>
                                        <div className="method-item">
                                            <div className="method-info">
                                                <div className="method-icon">📧</div>
                                                <div className="method-details">
                                                    <h4>Email Notifications</h4>
                                                    <p>Receive notifications via email</p>
                                                </div>
                                            </div>
                                            <div className="toggle-switch active"></div>
                                        </div>

                                        <div className="method-item">
                                            <div className="method-info">
                                                <div className="method-icon">📱</div>
                                                <div className="method-details">
                                                    <h4>SMS Notifications</h4>
                                                    <p>Receive notifications via text message</p>
                                                </div>
                                            </div>
                                            <div className="toggle-switch"></div>
                                        </div>

                                        <div className="method-item">
                                            <div className="method-info">
                                                <div className="method-icon">🔔</div>
                                                <div className="method-details">
                                                    <h4>Push Notifications</h4>
                                                    <p>Receive notifications in your browser/app</p>
                                                </div>
                                            </div>
                                            <div className="toggle-switch active"></div>
                                        </div>
                                    </div>

                                    <div className="notification-types">
                                        <h4 className="types-title">Notification Types</h4>
                                        <div className="type-item">
                                            <div className="type-info">
                                                <div className="type-icon">🔍</div>
                                                <div className="type-details">
                                                    <h4>Job Alerts</h4>
                                                    <p>Get notified about new jobs matching your preferences</p>
                                                </div>
                                            </div>
                                            <div className="toggle-switch active"></div>
                                        </div>

                                        <div className="type-item">
                                            <div className="type-info">
                                                <div className="type-icon">📋</div>
                                                <div className="type-details">
                                                    <h4>Application Updates</h4>
                                                    <p>Receive updates on your job applications</p>
                                                </div>
                                            </div>
                                            <div className="toggle-switch active"></div>
                                        </div>

                                        <div className="type-item">
                                            <div className="type-info">
                                                <div className="type-icon">❤️</div>
                                                <div className="type-details">
                                                    <h4>Saved Jobs</h4>
                                                    <p>Notifications about saved jobs</p>
                                                </div>
                                            </div>
                                            <div className="toggle-switch"></div>
                                        </div>

                                        <div className="type-item">
                                            <div className="type-info">
                                                <div className="type-icon">💡</div>
                                                <div className="type-details">
                                                    <h4>Profile Suggestions</h4>
                                                    <p>Get suggestions to improve your profile</p>
                                                </div>
                                            </div>
                                            <div className="toggle-switch active"></div>
                                        </div>
                                    </div>

                                    <div className="save-section">
                                        <button className="save-button">Save Preferences</button>
                                    </div>
                                </div>

                                {/* Privacy Settings */}
                                <div className="settings-card">
                                    <div className="settings-section-header">
                                        <h3 className="settings-section-title">🔒 Privacy Settings</h3>
                                        <p className="settings-section-description">Control who can see your profile and personal information</p>
                                    </div>

                                    <div className="profile-visibility">
                                        <h4 className="visibility-title">Profile Visibility</h4>
                                        <div className="visibility-selector">
                                            <select className="visibility-dropdown">
                                                <option>Public - Visible to everyone</option>
                                                <option>Private - Only visible to employers</option>
                                                <option>Hidden - Not visible in search</option>
                                            </select>
                                            <span className="current-visibility">Public - Visible to everyone</span>
                                        </div>
                                    </div>

                                    <div className="privacy-controls">
                                        <div className="privacy-item">
                                            <div className="privacy-info">
                                                <div className="privacy-icon">📧</div>
                                                <div className="privacy-details">
                                                    <h4>Email Visibility</h4>
                                                    <p>Allow others to see your email address</p>
                                                </div>
                                            </div>
                                            <div className="toggle-switch active"></div>
                                        </div>

                                        <div className="privacy-item">
                                            <div className="privacy-info">
                                                <div className="privacy-icon">📱</div>
                                                <div className="privacy-details">
                                                    <h4>Phone Visibility</h4>
                                                    <p>Allow others to see your phone number</p>
                                                </div>
                                            </div>
                                            <div className="toggle-switch"></div>
                                        </div>

                                        <div className="privacy-item">
                                            <div className="privacy-info">
                                                <div className="privacy-icon">📍</div>
                                                <div className="privacy-details">
                                                    <h4>Location Visibility</h4>
                                                    <p>Show your location on your profile</p>
                                                </div>
                                            </div>
                                            <div className="toggle-switch active"></div>
                                        </div>

                                        <div className="privacy-item">
                                            <div className="privacy-info">
                                                <div className="privacy-icon">💼</div>
                                                <div className="privacy-details">
                                                    <h4>Experience Visibility</h4>
                                                    <p>Display your work experience</p>
                                                </div>
                                            </div>
                                            <div className="toggle-switch active"></div>
                                        </div>

                                        <div className="privacy-item">
                                            <div className="privacy-info">
                                                <div className="privacy-icon">🎓</div>
                                                <div className="privacy-details">
                                                    <h4>Education Visibility</h4>
                                                    <p>Show your educational background</p>
                                                </div>
                                            </div>
                                            <div className="toggle-switch active"></div>
                                        </div>

                                        <div className="privacy-item">
                                            <div className="privacy-info">
                                                <div className="privacy-icon">💬</div>
                                                <div className="privacy-details">
                                                    <h4>Allow Messaging</h4>
                                                    <p>Allow other users to message you</p>
                                                </div>
                                            </div>
                                            <div className="toggle-switch"></div>
                                        </div>

                                        <div className="privacy-item">
                                            <div className="privacy-info">
                                                <div className="privacy-icon">🔍</div>
                                                <div className="privacy-details">
                                                    <h4>Profile Search</h4>
                                                    <p>Allow your profile to appear in search results</p>
                                                </div>
                                            </div>
                                            <div className="toggle-switch active"></div>
                                        </div>
                                    </div>

                                    <div className="save-section">
                                        <button className="save-button">Save Privacy Settings</button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                    
                    {/* Account Section */}
                    {activeTab === 'account' && (
                        <section className="account-management-section">
                            <h2>Account Management</h2>
                            <div className="account-management-content">
                                {/* Profile Editing Section */}
                                <div className="management-card">
                                    <div className="management-section-header">
                                        <h3 className="management-section-title">👤 Profile Editing</h3>
                                        <p className="management-section-description">Manage your personal information and profile details</p>
                                    </div>

                                    <div className="profile-info-grid">
                                        <div className="profile-info-item">
                                            <span className="profile-info-label">Name</span>
                                            <span className="profile-info-value">{profile.firstName} {profile.middleName} {profile.lastName}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <span className="profile-info-label">Username</span>
                                            <span className="profile-info-value">{profile.username}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <span className="profile-info-label">Email</span>
                                            <span className="profile-info-value">{profile.email}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <span className="profile-info-label">Phone</span>
                                            <span className="profile-info-value">{profile.phone || '+251947765311'}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <span className="profile-info-label">Age</span>
                                            <span className="profile-info-value">{profile.age || 'Not specified'}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <span className="profile-info-label">Gender</span>
                                            <span className="profile-info-value">{profile.gender || 'Not specified'}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <span className="profile-info-label">Degree</span>
                                            <span className="profile-info-value">{profile.degree || 'Bachelor'}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <span className="profile-info-label">Field of Study</span>
                                            <span className="profile-info-value">{profile.fieldOfStudy || 'computer science'}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <span className="profile-info-label">Experience</span>
                                            <span className="profile-info-value">{profile.experience || '5'} years</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <span className="profile-info-label">Location</span>
                                            <span className="profile-info-value">{profile.location || 'Not specified'}</span>
                                        </div>
                                        <div className="profile-info-item">
                                            <span className="profile-info-label">Graduation Year</span>
                                            <span className="profile-info-value">{profile.graduationYear || '2020'}</span>
                                        </div>
                                    </div>

                                    <div className="edit-profile-section">
                                        <button className="action-button" onClick={() => setActiveTab('profile')}>
                                            ✏️ Edit Profile
                                        </button>
                                    </div>
                                </div>

                                {/* Security Settings */}
                                <div className="management-card">
                                    <div className="management-section-header">
                                        <h3 className="management-section-title">🔒 Security Settings</h3>
                                        <p className="management-section-description">Update your password and security preferences</p>
                                    </div>

                                    <form className="security-form">
                                        <div className="security-form-group">
                                            <label className="security-form-label">Current Password</label>
                                            <input
                                                type="password"
                                                className="security-form-input"
                                                placeholder="Enter current password"
                                            />
                                        </div>

                                        <div className="security-form-group">
                                            <label className="security-form-label">New Password</label>
                                            <input
                                                type="password"
                                                className="security-form-input"
                                                placeholder="Enter new password"
                                            />
                                        </div>

                                        <div className="security-form-group">
                                            <label className="security-form-label">Confirm New Password</label>
                                            <input
                                                type="password"
                                                className="security-form-input"
                                                placeholder="Confirm new password"
                                            />
                                        </div>

                                        <div className="update-password-section">
                                            <button type="submit" className="action-button">
                                                🔄 Update Password
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Account Verification */}
                                <div className="management-card">
                                    <div className="management-section-header">
                                        <h3 className="management-section-title">✅ Account Verification</h3>
                                        <p className="management-section-description">Verify your identity to unlock premium features and build trust with employers</p>
                                    </div>

                                    <div className="verification-status pending">
                                        <div className="verification-status-icon">⏳</div>
                                        <div className="verification-status-text">Verification Status: Pending</div>
                                    </div>

                                    <div className="verification-levels">
                                        <div className="verification-level">
                                            <h4 className="verification-level-name">Basic</h4>
                                            <p className="verification-level-description">Email and phone verification</p>
                                            <div className="verification-features">
                                                <div className="verification-feature">Apply to jobs</div>
                                                <div className="verification-feature">Save job listings</div>
                                                <div className="verification-feature">Receive notifications</div>
                                            </div>
                                        </div>

                                        <div className="verification-level">
                                            <h4 className="verification-level-name">Standard</h4>
                                            <p className="verification-level-description">Identity verification</p>
                                            <div className="verification-features">
                                                <div className="verification-feature">Enhanced profile visibility</div>
                                                <div className="verification-feature">Priority job alerts</div>
                                                <div className="verification-feature">Access to premium jobs</div>
                                            </div>
                                            <button className="upgrade-button">Upgrade to Standard</button>
                                        </div>

                                        <div className="verification-level">
                                            <h4 className="verification-level-name">Premium</h4>
                                            <p className="verification-level-description">Professional verification</p>
                                            <div className="verification-features">
                                                <div className="verification-feature">Top profile visibility</div>
                                                <div className="verification-feature">Direct messaging from employers</div>
                                                <div className="verification-feature">Exclusive job opportunities</div>
                                            </div>
                                            <button className="upgrade-button">Upgrade to Premium</button>
                                        </div>
                                    </div>

                                    <div className="document-verification">
                                        <h4>Document Verification</h4>
                                        <p>Submit the following documents to complete your verification</p>

                                        <div className="document-item">
                                            <div className="document-info">
                                                <div className="document-icon">🆔</div>
                                                <div className="document-details">
                                                    <h5>Government ID</h5>
                                                    <p>Passport, Driver's License, or National ID</p>
                                                </div>
                                            </div>
                                            <div className="document-status">
                                                <span className="status-badge submitted">Submitted</span>
                                                <span className="status-badge verified">Verified</span>
                                            </div>
                                        </div>

                                        <div className="document-item">
                                            <div className="document-info">
                                                <div className="document-icon">🏠</div>
                                                <div className="document-details">
                                                    <h5>Proof of Address</h5>
                                                    <p>Utility bill or bank statement (within 3 months)</p>
                                                </div>
                                            </div>
                                            <div className="document-status">
                                                <span className="status-badge pending">Pending</span>
                                                <button className="upload-button">Upload</button>
                                            </div>
                                        </div>

                                        <div className="document-item">
                                            <div className="document-info">
                                                <div className="document-icon">📸</div>
                                                <div className="document-details">
                                                    <h5>Professional Photo</h5>
                                                    <p>Clear headshot for your profile</p>
                                                </div>
                                            </div>
                                            <div className="document-status">
                                                <span className="status-badge pending">Pending</span>
                                                <button className="upload-button">Upload</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="verification-benefits">
                                        <h4>Why Verify Your Account?</h4>
                                        <div className="benefits-list">
                                            <div className="benefit-item">
                                                <span className="benefit-icon">📈</span>
                                                <div className="benefit-content">
                                                    <h5>Increased Job Opportunities</h5>
                                                    <p>Verified profiles get 3x more interview requests</p>
                                                </div>
                                            </div>
                                            <div className="benefit-item">
                                                <span className="benefit-icon">🛡️</span>
                                                <div className="benefit-content">
                                                    <h5>Enhanced Security</h5>
                                                    <p>Protect your account from unauthorized access</p>
                                                </div>
                                            </div>
                                            <div className="benefit-item">
                                                <span className="benefit-icon">🎯</span>
                                                <div className="benefit-content">
                                                    <h5>Better Matching</h5>
                                                    <p>Get matched with jobs that fit your verified skills</p>
                                                </div>
                                            </div>
                                            <div className="benefit-item">
                                                <span className="benefit-icon">🏆</span>
                                                <div className="benefit-content">
                                                    <h5>Trust with Employers</h5>
                                                    <p>Stand out with a verified profile badge</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="management-card">
                                    <div className="management-section-header">
                                        <h3 className="management-section-title">📞 Contact Information</h3>
                                        <p className="management-section-description">Manage how employers and recruiters can contact you</p>
                                    </div>

                                    <div className="contact-info-grid">
                                        <div className="contact-info-item">
                                            <span className="contact-info-label">Email</span>
                                            <span className="contact-info-value">{profile.email}</span>
                                        </div>
                                        <div className="contact-info-item">
                                            <span className="contact-info-label">Phone</span>
                                            <span className="contact-info-value">{profile.phone || '+251947765311'}</span>
                                        </div>
                                        <div className="contact-info-item">
                                            <span className="contact-info-label">Address</span>
                                            <span className="contact-info-value">{profile.location || profile.address || 'Bahirdar'}</span>
                                        </div>
                                        <div className="contact-info-item">
                                            <span className="contact-info-label">Website</span>
                                            <span className="contact-info-value not-provided">{profile.website || 'Not provided'}</span>
                                        </div>
                                    </div>

                                    <div className="edit-profile-section">
                                        <button className="action-button" onClick={() => setActiveTab('profile')}>
                                            ✏️ Edit Contact Info
                                        </button>
                                    </div>
                                </div>

                                {/* Social Media Links */}
                                <div className="management-card">
                                    <div className="management-section-header">
                                        <h3 className="management-section-title">🔗 Social Media Links</h3>
                                        <p className="management-section-description">Connect your social media profiles to enhance your professional presence</p>
                                    </div>

                                    <div className="social-links-grid">
                                        <div className="social-link-item">
                                            <div className="social-link-info">
                                                <div className="social-link-icon">💼</div>
                                                <div className="social-link-details">
                                                    <h5>LinkedIn</h5>
                                                    <p>Professional networking platform</p>
                                                </div>
                                            </div>
                                            <div className="social-link-url">
                                                <a href="https://linkedin.com/in/johndoe" target="_blank" rel="noopener noreferrer">
                                                    https://linkedin.com/in/johndoe
                                                </a>
                                            </div>
                                        </div>

                                        <div className="social-link-item">
                                            <div className="social-link-info">
                                                <div className="social-link-icon">💻</div>
                                                <div className="social-link-details">
                                                    <h5>GitHub</h5>
                                                    <p>Code repository and portfolio</p>
                                                </div>
                                            </div>
                                            <div className="social-link-url">
                                                <a href="https://github.com/johndoe" target="_blank" rel="noopener noreferrer">
                                                    https://github.com/johndoe
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="edit-profile-section">
                                        <button className="action-button">
                                            ➕ Add Link
                                        </button>
                                    </div>
                                </div>

                                {/* Activity History */}
                                <div className="management-card">
                                    <div className="management-section-header">
                                        <h3 className="management-section-title">📊 Activity History</h3>
                                        <p className="management-section-description">Track your account activity and important events</p>
                                    </div>

                                    <div className="activity-history">
                                        <div className="activity-item">
                                            <div className="activity-icon">📋</div>
                                            <div className="activity-content">
                                                <div className="activity-title">Applied for Frontend Developer Position</div>
                                                <div className="activity-description">Application submitted for Frontend Developer at TechCorp Inc.</div>
                                                <div className="activity-meta">6/15/2023, 1:30:00 PM</div>
                                            </div>
                                        </div>

                                        <div className="activity-item">
                                            <div className="activity-icon">✏️</div>
                                            <div className="activity-content">
                                                <div className="activity-title">Updated Profile</div>
                                                <div className="activity-description">Updated contact information and skills</div>
                                                <div className="activity-meta">6/14/2023, 5:22:00 PM</div>
                                            </div>
                                        </div>

                                        <div className="activity-item">
                                            <div className="activity-icon">📄</div>
                                            <div className="activity-content">
                                                <div className="activity-title">Uploaded New Resume</div>
                                                <div className="activity-description">Uploaded updated resume with recent experience</div>
                                                <div className="activity-meta">6/12/2023, 12:15:00 PM</div>
                                            </div>
                                        </div>

                                        <div className="activity-item">
                                            <div className="activity-icon">🔐</div>
                                            <div className="activity-content">
                                                <div className="activity-title">Logged In</div>
                                                <div className="activity-description">Successful login from IP address 192.168.1.100</div>
                                                <div className="activity-meta">6/10/2023, 11:45:00 AM</div>
                                            </div>
                                        </div>

                                        <div className="activity-item">
                                            <div className="activity-icon">⚙️</div>
                                            <div className="activity-content">
                                                <div className="activity-title">Updated Notification Settings</div>
                                                <div className="activity-description">Changed email notification preferences</div>
                                                <div className="activity-meta">6/8/2023, 7:30:00 PM</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Download Profile Data */}
                                <div className="management-card">
                                    <div className="management-section-header">
                                        <h3 className="management-section-title">📥 Download Your Profile Data</h3>
                                        <p className="management-section-description">Get a copy of your profile information in various formats</p>
                                    </div>

                                    <div className="download-options">
                                        <div className="download-option">
                                            <div className="download-icon">📄</div>
                                            <h5>PDF Document</h5>
                                            <p>Professional format for job applications</p>
                                            <button className="download-button">📥 Download PDF</button>
                                        </div>

                                        <div className="download-option">
                                            <div className="download-icon">💾</div>
                                            <h5>JSON Data</h5>
                                            <p>Structured data for developers</p>
                                            <button className="download-button">📥 Download JSON</button>
                                        </div>

                                        <div className="download-option">
                                            <div className="download-icon">📊</div>
                                            <h5>CSV Spreadsheet</h5>
                                            <p>Tabular format for data analysis</p>
                                            <button className="download-button">📥 Download CSV</button>
                                        </div>
                                    </div>

                                    <div className="download-history">
                                        <h4>Download History</h4>

                                        <div className="download-history-item">
                                            <div className="download-history-info">
                                                <h6>PDF File</h6>
                                                <p>Downloaded on 2025-08-15</p>
                                            </div>
                                            <div className="download-history-meta">
                                                <div className="download-history-date">2025-08-15</div>
                                                <div className="download-history-size">2.4 MB</div>
                                            </div>
                                        </div>

                                        <div className="download-history-item">
                                            <div className="download-history-info">
                                                <h6>JSON File</h6>
                                                <p>Downloaded on 2025-08-01</p>
                                            </div>
                                            <div className="download-history-meta">
                                                <div className="download-history-date">2025-08-01</div>
                                                <div className="download-history-size">1.1 MB</div>
                                            </div>
                                        </div>

                                        <div className="download-history-item">
                                            <div className="download-history-info">
                                                <h6>CSV File</h6>
                                                <p>Downloaded on 2025-07-15</p>
                                            </div>
                                            <div className="download-history-meta">
                                                <div className="download-history-date">2025-07-15</div>
                                                <div className="download-history-size">0.8 MB</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="data-info">
                                        <h4>About Your Data</h4>
                                        <ul>
                                            <li>Includes all profile information, skills, and experience</li>
                                            <li>Contains application history and saved jobs</li>
                                            <li>Excludes private messages and password information</li>
                                            <li>Data is updated in real-time</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="danger-zone">
                                    <h3>Danger Zone</h3>
                                    <p>Permanently delete your account and all associated data</p>
                                    <div className="delete-account-section">
                                        <button className="action-button danger" onClick={() => setShowDeleteConfirm(true)}>
                                            🗑️ Delete Account
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {showDeleteConfirm && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="delete-confirm"
                                            >
                                                <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                                                <div className="confirm-buttons">
                                                    <button
                                                        className="cancel-btn"
                                                        onClick={() => setShowDeleteConfirm(false)}
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        className="confirm-delete-btn"
                                                        onClick={handleDeleteAccount}
                                                    >
                                                        Yes, Delete
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </section>
                    )}
                    
                    {/* Statistics Section */}
                    {activeTab === 'stats' && (
                        <section className="account-statistics-section">
                            <h2>Account Statistics</h2>
                            <div className="account-statistics-content">
                                <div className="account-stats">
                                    <h3>Account Statistics</h3>
                                    <p className="stats-subtitle">
                                        Track your job application progress and profile completeness
                                    </p>

                                    <div className="stats-grid">
                                        <motion.div
                                            className="stat-card"
                                            whileHover={{ y: -5 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="stat-icon total">
                                                📋
                                            </div>
                                            <div className="stat-info">
                                                <h4>1</h4>
                                                <p>Total Applications</p>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            className="stat-card"
                                            whileHover={{ y: -5 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="stat-icon pending">
                                                ⏳
                                            </div>
                                            <div className="stat-info">
                                                <h4>0</h4>
                                                <p>Pending</p>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            className="stat-card"
                                            whileHover={{ y: -5 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="stat-icon approved">
                                                ✅
                                            </div>
                                            <div className="stat-info">
                                                <h4>0</h4>
                                                <p>Approved</p>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            className="stat-card"
                                            whileHover={{ y: -5 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="stat-icon rejected">
                                                ❌
                                            </div>
                                            <div className="stat-info">
                                                <h4>0</h4>
                                                <p>Rejected</p>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            className="stat-card"
                                            whileHover={{ y: -5 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="stat-icon profile">
                                                👤
                                            </div>
                                            <div className="stat-info">
                                                <h4>75%</h4>
                                                <p>Profile Complete</p>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            className="stat-card"
                                            whileHover={{ y: -5 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="stat-icon trending">
                                                📈
                                            </div>
                                            <div className="stat-info">
                                                <h4>8.5/10</h4>
                                                <p>Match Score</p>
                                            </div>
                                        </motion.div>
                                    </div>

                                    <div className="application-trend">
                                        <h4>Application Status Overview</h4>
                                        <div className="trend-bars">
                                            <div className="trend-bar">
                                                <div
                                                    className="bar pending-bar"
                                                    style={{
                                                        width: '0%',
                                                        backgroundColor: '#f59e0b'
                                                    }}
                                                ></div>
                                                <span>Pending</span>
                                                <span className="percentage">0%</span>
                                            </div>
                                            <div className="trend-bar">
                                                <div
                                                    className="bar approved-bar"
                                                    style={{
                                                        width: '0%',
                                                        backgroundColor: '#10b981'
                                                    }}
                                                ></div>
                                                <span>Approved</span>
                                                <span className="percentage">0%</span>
                                            </div>
                                            <div className="trend-bar">
                                                <div
                                                    className="bar rejected-bar"
                                                    style={{
                                                        width: '0%',
                                                        backgroundColor: '#ef4444'
                                                    }}
                                                ></div>
                                                <span>Rejected</span>
                                                <span className="percentage">0%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="stats-summary">
                                        <div className="summary-card">
                                            <h5>📊 Application Rate</h5>
                                            <p>Applications submitted per week</p>
                                            <div className="summary-metric">1.0/week</div>
                                        </div>

                                        <div className="summary-card">
                                            <h5>🎯 Response Rate</h5>
                                            <p>Employers who viewed your profile</p>
                                            <div className="summary-metric">0%</div>
                                        </div>

                                        <div className="summary-card">
                                            <h5>⭐ Profile Strength</h5>
                                            <p>Overall profile completeness score</p>
                                            <div className="summary-metric">Good</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Footer - unchanged */}
            <motion.footer className="careerplus__footer"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="careerplus__footer-container">
                    <div className="careerplus__footer-brand">
                        <h3 className="careerplus__logo">CareerPlus</h3>
                        <p className="careerplus__footer-text">
                            AI-powered job matching for the modern professional.
                        </p>
                    </div>
                    <div className="careerplus__footer-links">
                        <h4 className="careerplus__footer-heading">Quick Links</h4>
                        <a href="/" className="careerplus__footer-link">Home</a>
                        <a href="/jobseekeraccount" className="careerplus__footer-link">Account</a>
                        <a href="/notificationlist" className="careerplus__footer-link">Notifications</a>
                    </div>
                    <div className="careerplus__footer-contact">
                        <h4 className="careerplus__footer-heading">Contact Us</h4>
                        <p className="careerplus__footer-text">hello@careerplus.com</p>
                        <p className="careerplus__footer-text">+251 (9) 123-456</p>
                    </div>
                    <div className="careerplus__footer-social">
                        <h4 className="careerplus__footer-heading">Follow Us</h4>
                        <div className="careerplus__social-icons">
                            <a href="#" className="careerplus__social-icon"><FaLinkedin /></a>
                            <a href="#" className="careerplus__social-icon"><FaTwitter /></a>
                            <a href="#" className="careerplus__social-icon"><FaGithub /></a>
                        </div>
                    </div>
                </div>
                <div className="careerplus__footer-bottom">
                    <p>&copy; {new Date().getFullYear()} CareerPlus. All rights reserved.</p>
                </div>
            </motion.footer>
        </div>
    );
};

export default JobSeekerAccount;
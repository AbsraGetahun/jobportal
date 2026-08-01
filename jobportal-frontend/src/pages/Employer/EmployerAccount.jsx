import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUser, FiLock, FiBriefcase, FiPlus, FiLogOut, FiSun, FiMoon, FiHome, FiBell,
    FiEdit, FiMail, FiPhone, FiCalendar, FiMapPin, FiUsers, FiCloud, FiSettings,
    FiBarChart2, FiTrendingUp, FiCheckCircle, FiSearch, FiFile, FiAward, FiFolder,
    FiMessageSquare, FiEye, FiStar
} from 'react-icons/fi';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/Employer/EmployerAccount.css';
import '../../styles/pages/Employer/EmployerAccountComponents.css';
import '../../styles/components/Employer/AccountStats.css';
import '../../styles/components/Employer/PlatformFeatures.css';
import '../../styles/components/Employer/PremiumFeatures.css';
import '../../styles/components/Employer/AIRecommendations.css';
import '../../styles/components/Employer/AccountSettings.css';
import '../../styles/components/Employer/AccountManagement.css';
import '../../styles/components/Employer/AnalyticsInsights.css';
import '../../styles/components/Employer/FeedbackSection.css';
import '../../styles/components/Employer/SidebarNavigation.css';
import '../../styles/components/Employer/CompanyInformation.css';
import JobCard from '../../components/Employer/JobCard';
import ApplicantCard from '../../components/Employer/ApplicantCard';
import CompanyDetailModal from '../../components/Employer/CompanyDetailModal';
import ProfileCard from '../../components/Employer/ProfileCard';
import EditableForm from '../../components/Employer/EditableForm';
import SecurityForm from '../../components/Employer/SecurityForm';
import AccountStats from '../../components/Employer/AccountStats';
import NotificationPreferences from '../../components/Employer/NotificationPreferences';
import PrivacySettings from '../../components/Employer/PrivacySettings';
import CollapsibleSection from '../../components/CollapsibleSection';
import FeedbackMessage from '../../components/FeedbackMessage';
import LoadingSpinner from '../../components/LoadingSpinner';
import FeedbackForm from '../../components/FeedbackForm';
import profileImage from '../../assets/man1.jpg';
import api from '../../api';
import '../../styles/components/FeedbackForm.css';

const EmployerAccount = () => {
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

    // Active tab state
    const [activeTab, setActiveTab] = useState('profile');

    // Account editing state
    const [isEditingAccount, setIsEditingAccount] = useState(false);

    // Profile state
    const [profile, setProfile] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        username: '',
        age: '',
        gender: '',
        location: '',
        email: '',
        phone: '',
        profilePicture: profileImage
    });

    // Company state
    const [company, setCompany] = useState({
        name: '',
        location: '',
        yearEstablished: ''
    });

    // Jobs state
    const [jobs, setJobs] = useState([]);

    // Applicants state
    const [applicants, setApplicants] = useState([]);

    // Job update state
    const [editingJob, setEditingJob] = useState(null);
    const [jobFormData, setJobFormData] = useState({
        title: '',
        location: '',
        job_type: '',
        experience_level: '',
        salary_min: '',
        salary_max: '',
        category: '',
        application_deadline: '',
        description: ''
    });

    // Modal states
    const [showCompanyModal, setShowCompanyModal] = useState(false);
    const [showApplicantModal, setShowApplicantModal] = useState(false);
    const [currentJobApplicants, setCurrentJobApplicants] = useState([]);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Feedback state for better user notifications
    const [feedback, setFeedback] = useState({
        show: false,
        type: '', // 'success', 'error', 'warning'
        title: '',
        message: ''
    });

    // Feedback message state (JobSeeker style)
    const [feedbackMessage, setFeedbackMessage] = useState(null);

    // Loading states
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isUploadingResume, setIsUploadingResume] = useState(false);

    // Notification count state
    const [notificationCount, setNotificationCount] = useState(0);

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
            // Tab navigation with Alt + number keys
            if (event.altKey && event.key >= '1' && event.key <= '9') {
                event.preventDefault();
                const tabIndex = parseInt(event.key) - 1;
                const tabs = ['profile', 'jobs', 'applicants', 'company', 'analytics', 'recommendations', 'features', 'premium', 'settings', 'account', 'security'];
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

    // Fetch jobs and applicants from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const jobsResponse = await api.getMyJobs();
                const fetchedJobs = jobsResponse.data.data?.data || jobsResponse.data.data || jobsResponse.data;
                setJobs(Array.isArray(fetchedJobs) ? fetchedJobs : []);

                // Set company information from the first job (assuming all jobs belong to the same company)
                if (Array.isArray(fetchedJobs) && fetchedJobs.length > 0 && fetchedJobs[0].employer) {
                    setCompany({
                        name: fetchedJobs[0].employer.companyName || fetchedJobs[0].employer.name || '',
                        location: fetchedJobs[0].employer.companyLocation || fetchedJobs[0].employer.location || '',
                        yearEstablished: fetchedJobs[0].employer.establishmentYear || ''
                    });
                }

                // For each job, fetch its applicants
                const allApplicants = [];
                let hasApplicationErrors = false;
                if (Array.isArray(fetchedJobs)) {
                    for (const job of fetchedJobs) {
                        try {
                            const applicationsResponse = await api.getJobApplications(job.id);

                            let applications = [];
                            if (applicationsResponse.data && applicationsResponse.data.data) {
                                applications = Array.isArray(applicationsResponse.data.data)
                                    ? applicationsResponse.data.data
                                    : (applicationsResponse.data.data.data || []);
                            } else if (applicationsResponse.data) {
                                applications = Array.isArray(applicationsResponse.data)
                                    ? applicationsResponse.data
                                    : [];
                            }

                            if (Array.isArray(applications)) {
                                // Transform applications to match the expected applicant structure
                                const jobApplicants = applications.map(app => ({
                                    id: app.id,
                                    jobId: job.id,
                                    name: app.user?.name || 'Unknown Applicant',
                                    fieldOfStudy: app.user?.fieldOfStudy || 'Not specified',
                                    degree: app.user?.degree || 'Not specified',
                                    age: app.user?.age || 'Not specified',
                                    gender: app.user?.gender || 'Not specified',
                                    location: app.user?.location || 'Not specified',
                                    phoneNumber: app.user?.phone || 'Not specified',
                                    experience: app.user?.experience || 'Not specified',
                                    graduationYear: app.user?.graduationYear || 'Not specified',
                                    status: app.status || 'pending',
                                    coverLetter: app.cover_letter || '',
                                    resume: app.resume || ''
                                }));
                                // Transform applications to match the expected applicant structure
                                allApplicants.push(...jobApplicants);
                            } else {
                                console.warn(`Applications for job ${job.id} is not an array:`, applications);
                            }
                        } catch (error) {
                            console.error(`Error fetching applications for job ${job.id}:`, error);
                            hasApplicationErrors = true;
                        }
                    }
                }

                setApplicants(allApplicants);
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Error fetching data. Please try again later.');
            }
        };

        fetchData();
    }, []);

    // Fetch notification count
    useEffect(() => {
        const fetchNotificationCount = async () => {
            try {
                const response = await api.getNotifications();
                const unreadCount = Array.isArray(response.data)
                    ? response.data.filter(notification => !notification.is_read).length
                    : 0;
                setNotificationCount(unreadCount);
            } catch (error) {
                console.error('Error fetching notification count:', error);
                setNotificationCount(0);
            }
        };

        fetchNotificationCount();

        // Refresh notification count every 30 seconds
        const interval = setInterval(fetchNotificationCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // Fetch employer profile data
    useEffect(() => {
        const fetchProfile = async () => {
            console.log('🔄 FETCHING PROFILE FROM BACKEND...');
            try {
                const profileResponse = await api.getProfile();
                console.log('📥 RAW API RESPONSE:', profileResponse);
                console.log('📥 RESPONSE DATA:', profileResponse.data);
                console.log('📥 USER DATA FROM API:', profileResponse.data.data);

                const userData = profileResponse.data.data;
                console.log('📞 PHONE FROM API RESPONSE:', userData.phone);
                console.log('📞 PHONE TYPE:', typeof userData.phone);
                console.log('📞 PHONE IS NULL?', userData.phone === null);
                console.log('📞 PHONE IS UNDEFINED?', userData.phone === undefined);
                console.log('📞 PHONE IS EMPTY STRING?', userData.phone === '');
                console.log('📞 PHONE IS FALSY?', !userData.phone);

                // Parse the name into first, middle, and last names
                const nameParts = userData.name ? userData.name.split(' ') : [];
                const firstName = nameParts[0] || '';
                const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
                const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '';

                const newProfileState = {
                    firstName: firstName,
                    middleName: middleName,
                    lastName: lastName,
                    username: userData.username || '',
                    age: userData.age || '',
                    gender: userData.gender || '',
                    location: userData.location || '',
                    email: userData.email || '',
                    phone: userData.phone || '',
                    profilePicture: userData.profile_picture || profileImage,
                    // Employer-specific fields
                    companyName: userData.companyName || '',
                    companyLocation: userData.companyLocation || '',
                    employeesCount: userData.employeesCount || '',
                    establishmentYear: userData.establishmentYear || '',
                    isVerified: userData.is_verified || false
                };

                console.log('🔄 SETTING PROFILE STATE:', newProfileState);
                console.log('📞 phoneNumber in new state:', newProfileState.phoneNumber);

                setProfile(newProfileState);

                // Also update company state with user data
                setCompany({
                    name: userData.companyName || '',
                    location: userData.companyLocation || '',
                    yearEstablished: userData.establishmentYear || ''
                });

                console.log('✅ PROFILE FETCH COMPLETED');
            } catch (error) {
                console.error('❌ ERROR FETCHING PROFILE:', error);
                console.error('❌ ERROR RESPONSE:', error.response);
            }
        };

        fetchProfile();
    }, []);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const handleLogout = () => {
        logout();
        navigate('/dashboard');
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

    // Handle password update
    const handlePasswordUpdate = async (passwordData) => {
        try {
            // Make API call to update password
            const response = await api.updatePassword(passwordData);

            // Show success feedback
            setFeedbackMessage({
                type: 'success',
                message: 'Password updated successfully!'
            });

            console.log('Password updated successfully');
        } catch (error) {
            console.error('Error updating password:', error);

            // Show error feedback
            setFeedbackMessage({
                type: 'error',
                message: error.response?.data?.message || 'Failed to update password. Please try again.'
            });
        }
    };


    // Clear feedback when starting to edit
    const startEditingProfile = () => {
        setIsEditingProfile(true);
    };

    // Handle profile update
    const handleProfileUpdate = async (updatedData) => {
        console.log('🚀 ========== PROFILE UPDATE STARTED ==========');
        console.log('📅 Timestamp:', new Date().toISOString());
        setIsSavingProfile(true);
        setFeedbackMessage(null);

        try {
            // STEP 1: VALIDATE INPUT DATA
            console.log('🔍 STEP 1: VALIDATING INPUT DATA');
            if (!updatedData) {
                throw new Error('❌ CRITICAL: No data received from form! Form submission failed.');
            }

            console.log('✅ Form data exists:', Object.keys(updatedData));
            console.log('📝 Complete form data:', JSON.stringify(updatedData, null, 2));

            // Check required fields
            const requiredFields = ['firstName', 'lastName'];
            const missingFields = requiredFields.filter(field => !updatedData[field]);
            if (missingFields.length > 0) {
                throw new Error(`❌ CRITICAL: Missing required fields: ${missingFields.join(', ')}`);
            }

            // STEP 2: ANALYZE PHONE FIELD SPECIFICALLY
            console.log('📞 STEP 2: ANALYZING PHONE FIELD');
            console.log('📞 Phone value from form:', updatedData.phone);
            console.log('📞 Phone type:', typeof updatedData.phone);
            console.log('📞 Phone length:', updatedData.phone ? updatedData.phone.length : 0);
            console.log('📞 Phone is empty string?', updatedData.phone === '');
            console.log('📞 Phone is null?', updatedData.phone === null);
            console.log('📞 Phone is undefined?', updatedData.phone === undefined);
            console.log('📞 Phone is falsy?', !updatedData.phone);

            if (updatedData.phone === null || updatedData.phone === undefined) {
                console.warn('⚠️ WARNING: Phone field is null/undefined - this will cause data loss!');
            } else if (updatedData.phone === '') {
                console.warn('⚠️ WARNING: Phone field is empty string - backend may not update it');
            } else {
                console.log('✅ Phone field looks good:', updatedData.phone);
            }

            // STEP 3: PREPARE FORM DATA
            console.log('📦 STEP 3: PREPARING FORM DATA');
            const formData = new FormData();

            const fullName = `${updatedData.firstName} ${updatedData.middleName} ${updatedData.lastName}`.trim();
            console.log('📝 Constructed full name:', fullName);

            // Add all fields with detailed logging
            const fieldsToAdd = {
                name: fullName,
                username: updatedData.username || '',
                email: updatedData.email || '',
                phone: updatedData.phone || '',
                age: updatedData.age !== null ? updatedData.age : '',
                gender: updatedData.gender || '',
                location: updatedData.location || '',
                companyName: updatedData.companyName || '',
                companyLocation: updatedData.companyLocation || '',
                employeesCount: updatedData.employeesCount !== null ? updatedData.employeesCount : '',
                establishmentYear: updatedData.establishmentYear !== null ? updatedData.establishmentYear : ''
            };

            console.log('📤 STEP 4: FIELDS BEING ADDED TO FORM DATA:');
            Object.entries(fieldsToAdd).forEach(([key, value]) => {
                formData.append(key, value);
                console.log(`  ${key}: "${value}" (${typeof value})`);

                // Special debugging for phone field
                if (key === 'phone') {
                    console.log('📞 PHONE FIELD DEBUG:');
                    console.log('  Original value:', updatedData.phone);
                    console.log('  Processed value:', value);
                    console.log('  Is empty?', value === '');
                    console.log('  Is null?', value === null);
                    console.log('  Is undefined?', value === undefined);
                }
            });

            // Verify phone field was added correctly
            console.log('📞 VERIFYING PHONE IN FORM DATA:');
            for (let [key, value] of formData.entries()) {
                if (key === 'phone') {
                    console.log(`  ✅ Found phone in FormData: "${value}"`);
                    break;
                }
            }

            console.log('📤 STEP 5: FINAL FORM DATA SUMMARY:');
            console.log('  Name:', fullName);
            console.log('  Phone:', updatedData.phone || '(empty)');
            console.log('  Email:', updatedData.email || '(empty)');
            console.log('  Location:', updatedData.location || '(empty)');

            // Add profile picture if it's a file
            if (updatedData.profilePicture && updatedData.profilePicture !== profile.profilePicture) {
                // If it's a data URL (from file reader), convert it to a file
                if (typeof updatedData.profilePicture === 'string' && updatedData.profilePicture.startsWith('data:')) {
                    // This is a data URL, we need to convert it to a file
                    // Extract the base64 data
                    const base64Data = updatedData.profilePicture.split(',')[1];
                    const byteString = atob(base64Data);
                    const mimeString = updatedData.profilePicture.split(',')[0].split(':')[1].split(';')[0];
                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);
                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }
                    const blob = new Blob([ab], { type: mimeString });
                    const file = new File([blob], 'profile-pic.png', { type: mimeString });
                    formData.append('profile_picture', file);
                } else if (updatedData.profilePicture instanceof File) {
                    // It's already a file object
                    formData.append('profile_picture', updatedData.profilePicture);
                }
            }

            const response = await api.updateProfile(formData);
            console.log('🔄 Profile update response received:', response);

            // Update local state with response data
            if (response?.data?.data) {
                const updatedProfile = response.data.data;
                console.log('📝 Updated profile from backend:', updatedProfile);
                console.log('📞 Phone field from backend:', updatedProfile.phone);

                const newProfileState = {
                    ...profile,
                    firstName: updatedProfile.name ? updatedProfile.name.split(' ')[0] || '' : profile.firstName,
                    middleName: updatedProfile.name && updatedProfile.name.split(' ').length > 2 ? updatedProfile.name.split(' ').slice(1, -1).join(' ') || '' : profile.middleName,
                    lastName: updatedProfile.name && updatedProfile.name.split(' ').length > 1 ? updatedProfile.name.split(' ')[updatedProfile.name.split(' ').length - 1] || '' : profile.lastName,
                    email: updatedProfile.email || profile.email,
                    phone: updatedProfile.phone || profile.phone,
                    username: updatedProfile.username || profile.username,
                    age: updatedProfile.age !== undefined ? updatedProfile.age : profile.age,
                    gender: updatedProfile.gender || profile.gender,
                    location: updatedProfile.location || profile.location,
                    profilePicture: updatedProfile.profile_picture || profile.profilePicture,
                    companyName: updatedProfile.companyName || profile.companyName,
                    companyLocation: updatedProfile.companyLocation || profile.companyLocation,
                    employeesCount: updatedProfile.employeesCount || profile.employeesCount,
                    establishmentYear: updatedProfile.establishmentYear || profile.establishmentYear,
                    isVerified: updatedProfile.is_verified !== undefined ? updatedProfile.is_verified : profile.isVerified
                };

                console.log('🔄 Setting new profile state:', newProfileState);
                console.log('📞 New phoneNumber in state:', newProfileState.phoneNumber);

                setProfile(newProfileState);

                // Also update company state
                const newCompanyState = {
                    name: updatedProfile.companyName || profile.companyName || '',
                    location: updatedProfile.companyLocation || profile.companyLocation || '',
                    yearEstablished: updatedProfile.establishmentYear || profile.establishmentYear || ''
                };
                setCompany(newCompanyState);
            } else {
                console.error('❌ No valid response data received from backend');
            }

            setIsEditingProfile(false);

            // Show success feedback
            setFeedbackMessage({
                type: 'success',
                message: 'Profile updated successfully!'
            });

            setIsSavingProfile(false);

        } catch (error) {
            console.error('❌ ERROR UPDATING PROFILE:', error);
            let errorMessage = 'An error occurred while updating your profile. Please try again.';

            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        errorMessage = 'Invalid data provided. Please check your inputs and try again.';
                        break;
                    case 401:
                        errorMessage = 'Authentication failed. Please log in again.';
                        break;
                    case 403:
                        errorMessage = 'Access denied. You do not have permission to update your profile.';
                        break;
                    case 422:
                        errorMessage = 'Validation failed. Please check your inputs and try again.';
                        break;
                    case 500:
                        errorMessage = 'Server error. Please try again later.';
                        break;
                    default:
                        errorMessage = error.response.data?.message || `Server error (${error.response.status}). Please try again.`;
                }
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else {
                errorMessage = error.message || 'An unknown error occurred.';
            }

            setFeedbackMessage({
                type: 'error',
                message: errorMessage
            });

            setIsSavingProfile(false);
        }
    };

    // Handle applicant action
    const handleApplicantAction = async (applicantId, action) => {
        try {
            // Make API call to update application status
            const response = await api.updateApplicationStatus(applicantId, { status: action });

            // Update local state with response data
            setApplicants(prevApplicants =>
                prevApplicants.map(applicant =>
                    applicant.id === applicantId
                        ? { ...applicant, status: action }
                        : applicant
                )
            );

            alert(`Applicant ${action}ed successfully!`);
        } catch (error) {
            console.error(`Error ${action}ing applicant:`, error);
            alert(`Error ${action}ing applicant: ` + (error.response?.data?.message || error.message || "Unknown error"));
        }
    };

    // Show applicants for a specific job
    const showJobApplicants = (jobId) => {
        const jobApplicants = applicants.filter(a => a.jobId === jobId);
        setCurrentJobApplicants(jobApplicants);
        setShowApplicantModal(true);
    };


    // Handle job update
    const handleJobUpdate = (jobId, jobData) => {
        console.log('Edit button clicked for job:', jobId, jobData);
        setEditingJob(jobId);
        setJobFormData({
            title: jobData.title || '',
            location: jobData.location || '',
            job_type: jobData.job_type || '',
            experience_level: jobData.experience_level || '',
            salary_min: jobData.salary_min || '',
            salary_max: jobData.salary_max || '',
            category: jobData.category || '',
            application_deadline: jobData.application_deadline || '',
            description: jobData.description || ''
        });
        console.log('Modal should now be visible with editingJob:', jobId);
    };

    // Handle job form change
    const handleJobFormChange = (e) => {
        const { name, value } = e.target;
        setJobFormData(prev => ({ ...prev, [name]: value }));
    };

    // Save job update
    const saveJobUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await api.updateJob(editingJob, jobFormData);
            const updatedJob = response.data.data || response.data;

            // Update the job in the jobs state
            setJobs(prevJobs =>
                prevJobs.map(job =>
                    job.id === editingJob ? { ...job, ...updatedJob } : job
                )
            );

            // Reset editing state
            setEditingJob(null);
            setJobFormData({
                title: '',
                location: '',
                job_type: '',
                experience_level: '',
                salary_min: '',
                salary_max: '',
                category: '',
                application_deadline: '',
                description: ''
            });

            alert("Job updated successfully!");
        } catch (error) {
            console.error("Error updating job:", error);
            alert("Failed to update job. Please try again.");
        }
    };

    // Cancel job update
    const cancelJobUpdate = () => {
        setEditingJob(null);
        setJobFormData({
            title: '',
            location: '',
            job_type: '',
            experience_level: '',
            salary_min: '',
            salary_max: '',
            category: '',
            application_deadline: '',
            description: ''
        });
    };

    // Handle job deletion
    const handleJobDelete = async (jobId) => {
        if (window.confirm("Are you sure you want to delete this job?")) {
            try {
                await api.deleteJob(jobId);

                // Remove the job from the jobs state
                setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));

                // Remove applicants for this job
                setApplicants(prevApplicants => prevApplicants.filter(applicant => applicant.jobId !== jobId));

                alert("Job deleted successfully!");
            } catch (error) {
                console.error("Error deleting job:", error);
                alert("Failed to delete job. Please try again.");
            }
        }
    };

    // Toggle company modal
    const toggleCompanyModal = () => {
        setShowCompanyModal(prev => !prev);
    };

    return (
        <div className={`employer-account ${theme}`} role="main">
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
                    <br />Alt + 1-11: Switch tabs
                    <br />Esc: Close messages
                </div>
            </div>

            {/* Header */}
            <motion.header
                className={`careerplus__header ${scrolled ? 'scrolled' : ''}`}
                initial={{ backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}
                animate={{
                    backgroundColor: scrolled
                        ? (theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)')
                        : (theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)')
                }}
                transition={{ duration: 0.3 }}
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
                        <button className="careerplus__nav-icon"
                          title="Home"
                          onClick={() => navigate('/')}
                          aria-label="Go to home page"
                            >
                            <FiHome />
                        </button>
                        <button
                            className="careerplus__nav-icon"
                            title="Post Job"
                            onClick={() => navigate('/employerjobposting')}
                            aria-label="Post a new job"
                        >
                            <FiPlus />
                        </button>
                        <button
                            className="careerplus__nav-icon"
                            title="Notifications"
                            onClick={() => navigate('/employernotifications')}
                            aria-label="View notifications"
                        >
                            <FiBell />
                            {notificationCount > 0 && (
                                <span className="notification-badge" aria-label={`${notificationCount} notifications`}>
                                    {notificationCount}
                                </span>
                            )}
                        </button>
                        <button
                            className="careerplus__nav-icon"
                            title="Logout"
                            onClick={handleLogout}
                            aria-label="Logout from account"
                        >
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
                <nav className="account-sidebar" role="navigation" aria-label="Account navigation">
                    <h3>Navigation</h3>

                    <Link
                        to="#"
                        className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                        title="Profile section (Alt + 1)"
                        aria-label="Profile section (Alt + 1)"
                    >
                        <span className="sidebar-icon"></span>
                        <span>Profile</span>
                    </Link>

                    <Link
                        to="#"
                        className={`sidebar-item ${activeTab === 'jobs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('jobs')}
                        title="Posted Jobs section (Alt + 2)"
                        aria-label="Posted Jobs section (Alt + 2)"
                    >
                        <span className="sidebar-icon"></span>
                        <span>Posted Jobs</span>
                        {jobs.length > 0 && (
                            <span className="notification-badge" aria-label={`${jobs.length} jobs`}>
                                {jobs.length}
                            </span>
                        )}
                    </Link>

                    <Link
                        to="#"
                        className={`sidebar-item ${activeTab === 'applicants' ? 'active' : ''}`}
                        onClick={() => setActiveTab('applicants')}
                        title="Applicants section (Alt + 3)"
                        aria-label="Applicants section (Alt + 3)"
                    >
                        <span className="sidebar-icon"></span>
                        <span>Applicants</span>
                        {applicants.filter(a => a.status === 'pending').length > 0 && (
                            <span className="notification-badge" aria-label={`${applicants.filter(a => a.status === 'pending').length} pending applicants`}>
                                {applicants.filter(a => a.status === 'pending').length}
                            </span>
                        )}
                    </Link>

                    <Link
                        to="#"
                        className={`sidebar-item ${activeTab === 'company' ? 'active' : ''}`}
                        onClick={() => setActiveTab('company')}
                        title="Company section (Alt + 4)"
                        aria-label="Company section (Alt + 4)"
                    >
                        <span className="sidebar-icon"></span>
                        <span>Company</span>
                    </Link>

                    <Link
                        to="#"
                        className={`sidebar-item ${activeTab === 'analytics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('analytics')}
                        title="Analytics section (Alt + 5)"
                        aria-label="Analytics section (Alt + 5)"
                    >
                        <span className="sidebar-icon"></span>
                        <span>Analytics</span>
                    </Link>

                    <Link
                        to="#"
                        className={`sidebar-item ${activeTab === 'recommendations' ? 'active' : ''}`}
                        onClick={() => setActiveTab('recommendations')}
                        title="AI Recommendations section (Alt + 6)"
                        aria-label="AI Recommendations section (Alt + 6)"
                    >
                        <span className="sidebar-icon"></span>
                        <span>AI Recommendations</span>
                    </Link>

                    <Link
                        to="#"
                        className={`sidebar-item ${activeTab === 'features' ? 'active' : ''}`}
                        onClick={() => setActiveTab('features')}
                        title="Platform Features section (Alt + 7)"
                        aria-label="Platform Features section (Alt + 7)"
                    >
                        <span className="sidebar-icon"></span>
                        <span>Features</span>
                    </Link>

                    <Link
                        to="#"
                        className={`sidebar-item ${activeTab === 'premium' ? 'active' : ''}`}
                        onClick={() => setActiveTab('premium')}
                        title="Premium Features section (Alt + 8)"
                        aria-label="Premium Features section (Alt + 8)"
                    >
                        <span className="sidebar-icon"></span>
                        <span>Premium Features</span>
                    </Link>

                    <Link
                        to="#"
                        className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                        title="Account Settings section (Alt + 9)"
                        aria-label="Account Settings section (Alt + 9)"
                    >
                        <span className="sidebar-icon"></span>
                        <span>Settings</span>
                    </Link>

                    <Link
                        to="#"
                        className={`sidebar-item ${activeTab === 'account' ? 'active' : ''}`}
                        onClick={() => setActiveTab('account')}
                        title="Account Management section (Alt + 10)"
                        aria-label="Account Management section (Alt + 10)"
                    >
                        <span className="sidebar-icon"></span>
                        <span>Account</span>
                    </Link>

                    <Link
                        to="#"
                        className={`sidebar-item ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                        title="Security Settings section (Alt + 11)"
                        aria-label="Security Settings section (Alt + 11)"
                    >
                        <span className="sidebar-icon"></span>
                        <span>Security</span>
                    </Link>

                    <Link
                        to="#"
                        className={`sidebar-item ${activeTab === 'feedback' ? 'active' : ''}`}
                        onClick={() => setActiveTab('feedback')}
                        title="Feedback section (Alt + 12)"
                        aria-label="Feedback section (Alt + 12)"
                    >
                        <span className="sidebar-icon"></span>
                        <span>Feedback</span>
                    </Link>
                </nav>

                {/* Main Content */}
                <div className="account-content" id="main-content" role="main">
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
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <FiCheckCircle size={24} />
                                        <div>
                                            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>Account Verified</h3>
                                            <p style={{ margin: '0', opacity: '0.9', fontSize: '0.9rem' }}>
                                                Your account has been verified by our administrators. You can now post jobs and receive applications.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="verification-status-section" style={{
                                        padding: '15px',
                                        marginBottom: '20px',
                                        borderRadius: '8px',
                                        background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        <FiCheckCircle size={24} />
                                        <div>
                                            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>Verification Pending</h3>
                                            <p style={{ margin: '0', opacity: '0.9', fontSize: '0.9rem' }}>
                                                Your account is pending verification by our administrators. Some features may be limited until verification is complete.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <ProfileCard
                                    profile={profile}
                                    isEditing={false}
                                    onEditToggle={() => setActiveTab('account')}
                                />

                                <div className="profile-actions">
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="edit-profile-btn"
                                        onClick={() => setActiveTab('account')}
                                    >
                                        <FiEdit /> Edit Profile
                                    </motion.button>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Jobs Section */}
                    {activeTab === 'jobs' && (
                        <section className="jobs-section">
                            <h2>My Posted Jobs</h2>
                            <div className="jobs-list">
                                {jobs.length > 0 ? (
                                    jobs.map(job => {
                                        const jobApplicants = applicants.filter(a => a.jobId === job.id);
                                        return (
                                            <JobCard
                                                key={job.id}
                                                job={job}
                                                onEdit={() => handleJobUpdate(job.id, job)}
                                                onDelete={() => handleJobDelete(job.id)}
                                                onViewApplicants={() => showJobApplicants(job.id)}
                                                applicantCount={jobApplicants.length}
                                            />
                                        );
                                    })
                                ) : (
                                    <p>No jobs found. Try posting a job first.</p>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Applicants Section */}
                    {activeTab === 'applicants' && (
                        <section className="applicants-section">
                            <h2>All Applicants</h2>
                            <div className="applicants-list">
                                {applicants.length > 0 ? (
                                    applicants.map(applicant => (
                                        <ApplicantCard
                                            key={applicant.id}
                                            applicant={applicant}
                                            onAccept={() => handleApplicantAction(applicant.id, 'accepted')}
                                            onReject={() => handleApplicantAction(applicant.id, 'rejected')}
                                        />
                                    ))
                                ) : (
                                    <div className="no-applicants-message">
                                        <p>No applicants found for your posted jobs.</p>
                                        <p className="help-text">
                                            If you've recently posted jobs, it may take a moment for applications to appear.
                                            Make sure job seekers have applied to your positions.
                                        </p>
                                        <button
                                            className="refresh-button"
                                            onClick={() => window.location.reload()}
                                        >
                                            Refresh Data
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Security Section */}
                    {activeTab === 'security' && (
                        <section className="security-section">
                            <h2>Security Settings</h2>
                            <div className="security-content">
                                <SecurityForm onPasswordUpdate={handlePasswordUpdate} />
                                <div className="danger-zone">
                                    <h3>Danger Zone</h3>
                                    <p>Permanently delete your account and all associated data</p>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="delete-account-btn"
                                        onClick={() => setShowDeleteConfirm(true)}
                                    >
                                        Delete Account
                                    </motion.button>

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

                    {/* Settings Section */}
                    {activeTab === 'settings' && (
                        <section className="settings-section">
                            <div className="account-settings">
                                <h2>Account Settings</h2>
                                <p className="settings-subtitle">
                                    Customize your account preferences, notification settings, and privacy controls
                                </p>

                                {/* Notification Preferences */}
                                <div className="settings-section">
                                    <div className="settings-section-header">
                                        <div className="settings-section-icon">🔔</div>
                                        <div>
                                            <h3 className="settings-section-title">Notification Preferences</h3>
                                            <p className="settings-section-description">Choose how you want to be notified about applications and account activity</p>
                                        </div>
                                    </div>

                                    <h4>Notification Methods</h4>
                                    <div className="notification-methods">
                                        <div className="notification-item active">
                                            <div className="notification-item-header">
                                                <div className="notification-icon">📧</div>
                                                <h5 className="notification-item-title">Email Notifications</h5>
                                            </div>
                                            <p className="notification-item-description">Receive notifications via email</p>
                                        </div>
                                        <div className="notification-item">
                                            <div className="notification-item-header">
                                                <div className="notification-icon">📱</div>
                                                <h5 className="notification-item-title">SMS Notifications</h5>
                                            </div>
                                            <p className="notification-item-description">Receive notifications via text message</p>
                                        </div>
                                        <div className="notification-item">
                                            <div className="notification-item-header">
                                                <div className="notification-icon">🔔</div>
                                                <h5 className="notification-item-title">Push Notifications</h5>
                                            </div>
                                            <p className="notification-item-description">Receive notifications in your browser/app</p>
                                        </div>
                                    </div>

                                    <h4>Notification Types</h4>
                                    <div className="notification-types">
                                        <div className="notification-item active">
                                            <div className="notification-item-header">
                                                <div className="notification-icon">📋</div>
                                                <h5 className="notification-item-title">Job Applications</h5>
                                            </div>
                                            <p className="notification-item-description">Get notified when candidates apply to your jobs</p>
                                        </div>
                                        <div className="notification-item active">
                                            <div className="notification-item-header">
                                                <div className="notification-icon">✅</div>
                                                <h5 className="notification-item-title">Job Approvals</h5>
                                            </div>
                                            <p className="notification-item-description">Receive updates on job posting approvals</p>
                                        </div>
                                        <div className="notification-item">
                                            <div className="notification-item-header">
                                                <div className="notification-icon">👥</div>
                                                <h5 className="notification-item-title">Candidate Updates</h5>
                                            </div>
                                            <p className="notification-item-description">Notifications about candidate status changes</p>
                                        </div>
                                        <div className="notification-item">
                                            <div className="notification-item-header">
                                                <div className="notification-icon">📊</div>
                                                <h5 className="notification-item-title">Analytics Reports</h5>
                                            </div>
                                            <p className="notification-item-description">Weekly analytics and performance reports</p>
                                        </div>
                                        <div className="notification-item">
                                            <div className="notification-item-header">
                                                <div className="notification-icon">🔧</div>
                                                <h5 className="notification-item-title">System Updates</h5>
                                            </div>
                                            <p className="notification-item-description">Important platform updates and maintenance</p>
                                        </div>
                                    </div>

                                    <div className="save-section">
                                        <button
                                            className="save-btn"
                                            onClick={() => {
                                                setFeedbackMessage({
                                                    type: 'success',
                                                    message: 'Notification preferences saved successfully!'
                                                });
                                            }}
                                        >
                                            Save Preferences
                                        </button>
                                    </div>
                                </div>

                                {/* Privacy Settings */}
                                <div className="settings-section">
                                    <div className="settings-section-header">
                                        <div className="settings-section-icon">🔒</div>
                                        <div>
                                            <h3 className="settings-section-title">Privacy Settings</h3>
                                            <p className="settings-section-description">Control who can see your company profile and job postings</p>
                                        </div>
                                    </div>

                                    <h4>Company Profile Visibility</h4>
                                    <div className="profile-visibility-selector">
                                        <div className="visibility-options">
                                            <div className="visibility-option active">Public - Visible to everyone</div>
                                            <div className="visibility-option">Private - Visible to logged-in users only</div>
                                            <div className="visibility-option">Hidden - Not visible in search results</div>
                                        </div>
                                    </div>

                                    <h4>Privacy Controls</h4>
                                    <div className="privacy-controls">
                                        <div className="privacy-control-item">
                                            <div className="privacy-control-header">
                                                <h5 className="privacy-control-title">Company Email Visibility</h5>
                                                <label className="privacy-toggle">
                                                    <input type="checkbox" defaultChecked />
                                                    <span className="privacy-slider"></span>
                                                </label>
                                            </div>
                                            <p className="privacy-control-description">Allow others to see your company email</p>
                                        </div>
                                        <div className="privacy-control-item">
                                            <div className="privacy-control-header">
                                                <h5 className="privacy-control-title">Company Phone Visibility</h5>
                                                <label className="privacy-toggle">
                                                    <input type="checkbox" defaultChecked />
                                                    <span className="privacy-slider"></span>
                                                </label>
                                            </div>
                                            <p className="privacy-control-description">Allow others to see your company phone</p>
                                        </div>
                                        <div className="privacy-control-item">
                                            <div className="privacy-control-header">
                                                <h5 className="privacy-control-title">Company Location Visibility</h5>
                                                <label className="privacy-toggle">
                                                    <input type="checkbox" defaultChecked />
                                                    <span className="privacy-slider"></span>
                                                </label>
                                            </div>
                                            <p className="privacy-control-description">Show your company location</p>
                                        </div>
                                        <div className="privacy-control-item">
                                            <div className="privacy-control-header">
                                                <h5 className="privacy-control-title">Company Size Visibility</h5>
                                                <label className="privacy-toggle">
                                                    <input type="checkbox" />
                                                    <span className="privacy-slider"></span>
                                                </label>
                                            </div>
                                            <p className="privacy-control-description">Display your company size</p>
                                        </div>
                                        <div className="privacy-control-item">
                                            <div className="privacy-control-header">
                                                <h5 className="privacy-control-title">Job Postings Visibility</h5>
                                                <label className="privacy-toggle">
                                                    <input type="checkbox" defaultChecked />
                                                    <span className="privacy-slider"></span>
                                                </label>
                                            </div>
                                            <p className="privacy-control-description">Show your active job postings</p>
                                        </div>
                                        <div className="privacy-control-item">
                                            <div className="privacy-control-header">
                                                <h5 className="privacy-control-title">Allow Candidate Messaging</h5>
                                                <label className="privacy-toggle">
                                                    <input type="checkbox" defaultChecked />
                                                    <span className="privacy-slider"></span>
                                                </label>
                                            </div>
                                            <p className="privacy-control-description">Allow candidates to message you</p>
                                        </div>
                                        <div className="privacy-control-item">
                                            <div className="privacy-control-header">
                                                <h5 className="privacy-control-title">Profile Search Indexing</h5>
                                                <label className="privacy-toggle">
                                                    <input type="checkbox" defaultChecked />
                                                    <span className="privacy-slider"></span>
                                                </label>
                                            </div>
                                            <p className="privacy-control-description">Allow your company profile to appear in search results</p>
                                        </div>
                                    </div>

                                    <div className="data-protection-notice">
                                        <p><strong>Data Protection:</strong> Your privacy settings help protect your company's sensitive information while maintaining visibility to potential candidates.</p>
                                    </div>

                                    <div className="save-section">
                                        <button
                                            className="save-btn"
                                            onClick={() => {
                                                setFeedbackMessage({
                                                    type: 'success',
                                                    message: 'Privacy settings saved successfully!'
                                                });
                                            }}
                                        >
                                            Save Privacy Settings
                                        </button>
                                    </div>
                                </div>

                                {/* Account Preferences */}
                                <div className="settings-section">
                                    <div className="settings-section-header">
                                        <div className="settings-section-icon">⚙️</div>
                                        <div>
                                            <h3 className="settings-section-title">Account Preferences</h3>
                                            <p className="settings-section-description">Configure default settings and preferences for your account</p>
                                        </div>
                                    </div>

                                    <div className="account-preferences">
                                        <div className="preference-card">
                                            <div className="preference-icon">📝</div>
                                            <h4 className="preference-title">Default Job Settings</h4>
                                            <p className="preference-description">Configure default settings for new job postings</p>
                                            <button className="preference-btn">Configure</button>
                                        </div>
                                        <div className="preference-card">
                                            <div className="preference-icon">📧</div>
                                            <h4 className="preference-title">Email Templates</h4>
                                            <p className="preference-description">Customize email templates for candidate communication</p>
                                            <button className="preference-btn">Manage Templates</button>
                                        </div>
                                        <div className="preference-card">
                                            <div className="preference-icon">👥</div>
                                            <h4 className="preference-title">Interview Process</h4>
                                            <p className="preference-description">Set up your standard interview workflow</p>
                                            <button className="preference-btn">Configure Process</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Company Section */}
                    {activeTab === 'company' && (
                        <section className="company-section">
                            <h2>Company Information</h2>
                            <div className="company-content">
                                {/* Company Avatar/Logo */}
                                <div className="company-avatar">
                                    {company.name ? company.name.charAt(0).toUpperCase() : 'C'}
                                </div>

                                <div className="company-details">
                                    <div className="company-info-item">
                                        <span className="company-info-label">Company Name</span>
                                        <span className="company-info-value">{company.name || 'smart'}</span>
                                    </div>
                                    <div className="company-info-item">
                                        <span className="company-info-label">Location</span>
                                        <span className="company-info-value">{company.location || 'Ethiopia'}</span>
                                    </div>
                                    <div className="company-info-item">
                                        <span className="company-info-label">Year Established</span>
                                        <span className="company-info-value">{company.yearEstablished || '2020'}</span>
                                    </div>
                                    <div className="company-info-item">
                                        <span className="company-info-label">Verification Status</span>
                                        <span className={`company-info-value ${profile.isVerified ? 'verified' : 'pending'}`}>
                                            {profile.isVerified ? 'Verified' : 'Pending Verification'}
                                        </span>
                                    </div>
                                    <div className="company-info-item">
                                        <span className="company-info-label">Employees</span>
                                        <span className="company-info-value">{profile.employeesCount || '30'}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={toggleCompanyModal}
                                    className="company-details-btn"
                                >
                                    View/Edit Company Details
                                </button>

                                {/* Company Stats */}
                                <div className="company-stats">
                                    <h3>Quick Stats</h3>
                                    <div className="company-stats-grid">
                                        <div className="company-stat-card">
                                            <span className="company-stat-number">{jobs.length}</span>
                                            <span className="company-stat-label">Active Jobs</span>
                                        </div>
                                        <div className="company-stat-card">
                                            <span className="company-stat-number">{applicants.length}</span>
                                            <span className="company-stat-label">Total Applications</span>
                                        </div>
                                        <div className="company-stat-card">
                                            <span className="company-stat-number">{applicants.filter(a => a.status === 'accepted').length}</span>
                                            <span className="company-stat-label">Successful Hires</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Analytics Section */}
                    {activeTab === 'analytics' && (
                        <section className="analytics-section">
                            <div className="analytics-insights">
                                <h2>Analytics & Insights</h2>
                                <p className="analytics-insights-subtitle">
                                    Employer Statistics - Track your job postings performance and hiring success
                                </p>

                                {/* Statistics Grid */}
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-icon total">
                                            <FiBriefcase />
                                        </div>
                                        <div className="stat-info">
                                            <h4>{jobs.length}</h4>
                                            <p>Total Jobs Posted</p>
                                        </div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-icon applications">
                                            <FiUsers />
                                        </div>
                                        <div className="stat-info">
                                            <h4>{applicants.length}</h4>
                                            <p>Total Applications</p>
                                        </div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-icon approved">
                                            <FiCheckCircle />
                                        </div>
                                        <div className="stat-info">
                                            <h4>{jobs.filter(job => job.status === 'approved').length}</h4>
                                            <p>Approved Jobs</p>
                                        </div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-icon hires">
                                            <FiCheckCircle />
                                        </div>
                                        <div className="stat-info">
                                            <h4>{applicants.filter(app => app.status === 'accepted').length}</h4>
                                            <p>Successful Hires</p>
                                        </div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-icon views">
                                            <FiEye />
                                        </div>
                                        <div className="stat-info">
                                            <h4>959</h4>
                                            <p>Profile Views</p>
                                        </div>
                                    </div>

                                    <div className="stat-card">
                                        <div className="stat-icon rating">
                                            <FiStar />
                                        </div>
                                        <div className="stat-info">
                                            <h4>3.6</h4>
                                            <p>Average Rating</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Job Performance Overview */}
                                <div className="job-performance-overview">
                                    <h4>Job Performance Overview</h4>
                                    <div className="performance-bars">
                                        <div className="performance-bar">
                                            <div
                                                className="bar approved-bar"
                                                style={{
                                                    width: `${(jobs.filter(job => job.status === 'approved').length / (jobs.length || 1)) * 100}%`,
                                                    backgroundColor: '#10b981'
                                                }}
                                            ></div>
                                            <span>Approved Jobs</span>
                                            <span className="percentage">{Math.round((jobs.filter(job => job.status === 'approved').length / (jobs.length || 1)) * 100)}%</span>
                                        </div>
                                        <div className="performance-bar">
                                            <div
                                                className="bar pending-bar"
                                                style={{
                                                    width: `${(jobs.filter(job => job.status === 'pending').length / (jobs.length || 1)) * 100}%`,
                                                    backgroundColor: '#3b82f6'
                                                }}
                                            ></div>
                                            <span>Pending Jobs</span>
                                            <span className="percentage">{Math.round((jobs.filter(job => job.status === 'pending').length / (jobs.length || 1)) * 100)}%</span>
                                        </div>
                                        <div className="performance-bar">
                                            <div
                                                className="bar rejected-bar"
                                                style={{
                                                    width: `${(jobs.filter(job => job.status === 'rejected').length / (jobs.length || 1)) * 100}%`,
                                                    backgroundColor: '#ef4444'
                                                }}
                                            ></div>
                                            <span>Rejected Jobs</span>
                                            <span className="percentage">{Math.round((jobs.filter(job => job.status === 'rejected').length / (jobs.length || 1)) * 100)}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Hiring Efficiency */}
                                <div className="hiring-efficiency">
                                    <h4>Hiring Efficiency</h4>
                                    <div className="efficiency-metrics">
                                        <div className="metric">
                                            <span className="metric-label">Application-to-Hire Ratio</span>
                                            <span className="metric-value">
                                                {applicants.length > 0
                                                    ? ((applicants.filter(app => app.status === 'accepted').length / applicants.length) * 100).toFixed(1)
                                                    : 0}%
                                            </span>
                                        </div>
                                        <div className="metric">
                                            <span className="metric-label">Average Applications per Job</span>
                                            <span className="metric-value">
                                                {jobs.length > 0
                                                    ? (applicants.length / jobs.length).toFixed(1)
                                                    : 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced Analytics */}
                                <div className="advanced-analytics">
                                    <h4>Advanced Analytics</h4>
                                    <div className="analytics-chart-placeholder">
                                        <h4>Application Trends Over Time</h4>
                                        <p>📊 Interactive charts and detailed analytics coming soon...</p>
                                        <p>This section will include:</p>
                                        <ul>
                                            <li>Monthly application trends</li>
                                            <li>Job performance metrics</li>
                                            <li>Candidate quality analysis</li>
                                            <li>Hiring success rates</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Performance Insights */}
                                <div className="performance-insights">
                                    <h4>Performance Insights</h4>
                                    <div className="insights-grid">
                                        <div className="insight-card">
                                            <h5>Time to Hire</h5>
                                            <p>Average: 12 days</p>
                                            <small>Industry average: 24 days</small>
                                        </div>
                                        <div className="insight-card">
                                            <h5>Application Quality</h5>
                                            <p>Score: 8.2/10</p>
                                            <small>Based on candidate profiles</small>
                                        </div>
                                        <div className="insight-card">
                                            <h5>Job Visibility</h5>
                                            <p>Views: 1,247</p>
                                            <small>Last 30 days</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Recommendations Section */}
                    {activeTab === 'recommendations' && (
                        <section className="recommendations-section">
                            <div className="ai-recommendations">
                                <h2>AI Recommendations</h2>
                                <p className="ai-subtitle">
                                    Leverage artificial intelligence to optimize your hiring process and find the perfect candidates
                                </p>

                                {/* Job Posting Optimization */}
                                <div className="optimization-section">
                                    <div className="optimization-header">
                                        <div className="optimization-icon">💡</div>
                                        <div>
                                            <h3 className="optimization-title">Job Posting Optimization</h3>
                                            <p className="optimization-description">AI-Powered Job Description Analysis - Based on your recent job postings, here are optimization suggestions:</p>
                                        </div>
                                    </div>

                                    <div className="optimization-tips">
                                        <div className="optimization-tip">
                                            <h5>Improve Salary Transparency</h5>
                                            <p>Jobs with clear salary ranges receive 30% more applications. Consider adding salary information to attract qualified candidates.</p>
                                        </div>
                                        <div className="optimization-tip">
                                            <h5>Enhance Skills Requirements</h5>
                                            <p>Your job descriptions could be more specific about required skills. Adding technical competencies increases match quality by 25%.</p>
                                        </div>
                                        <div className="optimization-tip">
                                            <h5>Company Culture Highlights</h5>
                                            <p>Mentioning company culture and benefits in job descriptions can improve applicant engagement by 40%.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Candidate Matching */}
                                <div className="matching-section">
                                    <div className="matching-header">
                                        <div className="matching-icon">🎯</div>
                                        <div>
                                            <h3 className="matching-title">Candidate Matching</h3>
                                            <p className="matching-description">Smart Candidate Recommendations - Our AI analyzes thousands of profiles to find the best matches for your positions:</p>
                                        </div>
                                    </div>

                                    <div className="matching-features">
                                        <div className="matching-feature">
                                            <div className="matching-feature-icon">🎯</div>
                                            <div className="matching-feature-content">
                                                <h5>Skills-Based Matching</h5>
                                                <p>Advanced algorithms match candidates based on technical skills, experience level, and job requirements.</p>
                                            </div>
                                        </div>
                                        <div className="matching-feature">
                                            <div className="matching-feature-icon">🎯</div>
                                            <div className="matching-feature-content">
                                                <h5>Cultural Fit Analysis</h5>
                                                <p>AI evaluates candidate profiles for cultural alignment with your company values.</p>
                                            </div>
                                        </div>
                                        <div className="matching-feature">
                                            <div className="matching-feature-icon">🎯</div>
                                            <div className="matching-feature-content">
                                                <h5>Experience Prediction</h5>
                                                <p>Predict candidate success probability based on historical hiring data and performance metrics.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="matching-stats">
                                        <div className="stat-box">
                                            <span className="stat-number">94%</span>
                                            <span className="stat-label">Match Accuracy</span>
                                        </div>
                                        <div className="stat-box">
                                            <span className="stat-number">60%</span>
                                            <span className="stat-label">Faster Hiring</span>
                                        </div>
                                        <div className="stat-box">
                                            <span className="stat-number">85%</span>
                                            <span className="stat-label">Retention Rate</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Market Insights */}
                                <div className="market-insights">
                                    <div className="insights-header">
                                        <div className="insights-icon">📊</div>
                                        <div>
                                            <h3 className="insights-title">Market Insights</h3>
                                            <p className="insights-description">Industry Trends & Salary Benchmarks</p>
                                        </div>
                                    </div>

                                    <div className="insights-grid">
                                        <div className="insight-item">
                                            <h5>Competitive Salary Analysis</h5>
                                            <p>Current market rates for your job categories. Stay competitive with data-driven salary recommendations.</p>
                                        </div>
                                        <div className="insight-item">
                                            <h5>Skills Demand Trends</h5>
                                            <p>Track which skills are most in demand in your industry. Adapt your requirements to current market needs.</p>
                                        </div>
                                        <div className="insight-item">
                                            <h5>Candidate Availability</h5>
                                            <p>Monitor candidate pool size and competition levels for different roles and locations.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Features Section */}
                    {activeTab === 'features' && (
                        <section className="features-section">
                            <div className="platform-features">
                                <h2>Platform Features</h2>
                                <p className="features-subtitle">
                                    Discover powerful tools designed to streamline your hiring process and enhance candidate experience
                                </p>

                                <div className="features-grid">
                                    {/* Job Posting Tools */}
                                    <div className="feature-category">
                                        <div className="category-header">
                                            <div className="category-icon">
                                                <FiBriefcase />
                                            </div>
                                            <div>
                                                <h3 className="category-title">Job Posting Tools</h3>
                                                <p className="category-description">Advanced capabilities to create compelling job postings</p>
                                            </div>
                                        </div>

                                        <div className="features-list">
                                            <div className="feature-item">
                                                <div className="feature-header">
                                                    <div className="feature-icon">
                                                        <FiEdit />
                                                    </div>
                                                    <h4 className="feature-title">Rich Text Editor</h4>
                                                </div>
                                                <p className="feature-description">Create compelling job descriptions with formatting options, images, and multimedia content</p>
                                                <div className="feature-benefits">
                                                    <span className="benefit-tag">Formatting</span>
                                                    <span className="benefit-tag">Media</span>
                                                    <span className="benefit-tag">Templates</span>
                                                </div>
                                            </div>

                                            <div className="feature-item">
                                                <div className="feature-header">
                                                    <div className="feature-icon">
                                                        <FiCloud />
                                                    </div>
                                                    <h4 className="feature-title">Multi-Platform Publishing</h4>
                                                </div>
                                                <p className="feature-description">Post jobs across multiple platforms simultaneously with automated cross-posting</p>
                                                <div className="feature-benefits">
                                                    <span className="benefit-tag">Auto-post</span>
                                                    <span className="benefit-tag">LinkedIn</span>
                                                    <span className="benefit-tag">Indeed</span>
                                                </div>
                                            </div>

                                            <div className="feature-item">
                                                <div className="feature-header">
                                                    <div className="feature-icon">
                                                        <FiBarChart2 />
                                                    </div>
                                                    <h4 className="feature-title">Application Tracking</h4>
                                                </div>
                                                <p className="feature-description">Monitor application status and candidate progress in real-time</p>
                                                <div className="feature-benefits">
                                                    <span className="benefit-tag">Real-time</span>
                                                    <span className="benefit-tag">Analytics</span>
                                                    <span className="benefit-tag">Reports</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Candidate Management */}
                                    <div className="feature-category">
                                        <div className="category-header">
                                            <div className="category-icon">
                                                <FiUsers />
                                            </div>
                                            <div>
                                                <h3 className="category-title">Candidate Management</h3>
                                                <p className="category-description">Streamlined hiring process from application to offer</p>
                                            </div>
                                        </div>

                                        <div className="features-list">
                                            <div className="feature-item">
                                                <div className="feature-header">
                                                    <div className="feature-icon">
                                                        <FiCheckCircle />
                                                    </div>
                                                    <h4 className="feature-title">Bulk Actions</h4>
                                                </div>
                                                <p className="feature-description">Manage multiple applications with batch operations for efficient processing</p>
                                                <div className="feature-benefits">
                                                    <span className="benefit-tag">Batch</span>
                                                    <span className="benefit-tag">Efficient</span>
                                                    <span className="benefit-tag">Time-saving</span>
                                                </div>
                                            </div>

                                            <div className="feature-item">
                                                <div className="feature-header">
                                                    <div className="feature-icon">
                                                        <FiCalendar />
                                                    </div>
                                                    <h4 className="feature-title">Interview Scheduling</h4>
                                                </div>
                                                <p className="feature-description">Integrated calendar for interview coordination and automated reminders</p>
                                                <div className="feature-benefits">
                                                    <span className="benefit-tag">Calendar</span>
                                                    <span className="benefit-tag">Reminders</span>
                                                    <span className="benefit-tag">Integration</span>
                                                </div>
                                            </div>

                                            <div className="feature-item">
                                                <div className="feature-header">
                                                    <div className="feature-icon">
                                                        <FiMessageSquare />
                                                    </div>
                                                    <h4 className="feature-title">Feedback Collection</h4>
                                                </div>
                                                <p className="feature-description">Gather structured feedback from interview teams with customizable forms</p>
                                                <div className="feature-benefits">
                                                    <span className="benefit-tag">Structured</span>
                                                    <span className="benefit-tag">Customizable</span>
                                                    <span className="benefit-tag">Analytics</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Communication Tools */}
                                    <div className="feature-category">
                                        <div className="category-header">
                                            <div className="category-icon">
                                                <FiMail />
                                            </div>
                                            <div>
                                                <h3 className="category-title">Communication Tools</h3>
                                                <p className="category-description">Enhanced communication throughout the hiring process</p>
                                            </div>
                                        </div>

                                        <div className="features-list">
                                            <div className="feature-item">
                                                <div className="feature-header">
                                                    <div className="feature-icon">
                                                        <FiMessageSquare />
                                                    </div>
                                                    <h4 className="feature-title">In-App Messaging</h4>
                                                </div>
                                                <p className="feature-description">Direct communication with candidates through secure in-app messaging</p>
                                                <div className="feature-benefits">
                                                    <span className="benefit-tag">Secure</span>
                                                    <span className="benefit-tag">Real-time</span>
                                                    <span className="benefit-tag">Private</span>
                                                </div>
                                            </div>

                                            <div className="feature-item">
                                                <div className="feature-header">
                                                    <div className="feature-icon">
                                                        <FiFile />
                                                    </div>
                                                    <h4 className="feature-title">Email Templates</h4>
                                                </div>
                                                <p className="feature-description">Professional email templates for different scenarios and hiring stages</p>
                                                <div className="feature-benefits">
                                                    <span className="benefit-tag">Professional</span>
                                                    <span className="benefit-tag">Customizable</span>
                                                    <span className="benefit-tag">Branded</span>
                                                </div>
                                            </div>

                                            <div className="feature-item">
                                                <div className="feature-header">
                                                    <div className="feature-icon">
                                                        <FiBell />
                                                    </div>
                                                    <h4 className="feature-title">Automated Notifications</h4>
                                                </div>
                                                <p className="feature-description">Keep candidates informed throughout the process with automated updates</p>
                                                <div className="feature-benefits">
                                                    <span className="benefit-tag">Automated</span>
                                                    <span className="benefit-tag">Timely</span>
                                                    <span className="benefit-tag">Personalized</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Premium CTA */}
                                <div className="premium-cta">
                                    <h3>Unlock Premium Features</h3>
                                    <p>Get access to advanced tools and unlimited usage</p>
                                    <button
                                        className="premium-btn"
                                        onClick={() => {
                                            setFeedbackMessage({
                                                type: 'info',
                                                message: 'Premium upgrade feature coming soon! Contact support for early access.'
                                            });
                                        }}
                                    >
                                        <FiCloud /> Upgrade to Premium
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Premium Features Section */}
                    {activeTab === 'premium' && (
                        <section className="premium-section">
                            <div className="premium-features">
                                <h2>Premium Features</h2>
                                <p className="premium-subtitle">
                                    Unlock advanced tools and premium capabilities to supercharge your hiring process
                                </p>

                                <div className="premium-features-grid">
                                    {/* Advanced Analytics */}
                                    <div className="premium-feature-card">
                                        <div className="premium-feature-header">
                                            <div className="premium-feature-icon">
                                                📊
                                            </div>
                                            <h3 className="premium-feature-title">Advanced Analytics</h3>
                                        </div>
                                        <p className="premium-feature-description">
                                            Comprehensive Analytics Dashboard - Get detailed insights into your hiring performance with advanced metrics and visualizations.
                                        </p>
                                        <div className="premium-feature-benefits">
                                            <span className="premium-benefit-tag">Real-time Reports</span>
                                            <span className="premium-benefit-tag">Custom Dashboards</span>
                                            <span className="premium-benefit-tag">Export Capabilities</span>
                                        </div>
                                    </div>

                                    {/* Priority Support */}
                                    <div className="premium-feature-card">
                                        <div className="premium-feature-header">
                                            <div className="premium-feature-icon">
                                                🎯
                                            </div>
                                            <h3 className="premium-feature-title">Priority Support</h3>
                                        </div>
                                        <p className="premium-feature-description">
                                            Dedicated Support Team - Get priority access to our expert support team for urgent hiring needs and technical assistance.
                                        </p>
                                        <div className="premium-feature-benefits">
                                            <span className="premium-benefit-tag">24/7 Support</span>
                                            <span className="premium-benefit-tag">Dedicated Manager</span>
                                            <span className="premium-benefit-tag">Priority Response</span>
                                        </div>
                                    </div>

                                    {/* AI-Powered Matching */}
                                    <div className="premium-feature-card">
                                        <div className="premium-feature-header">
                                            <div className="premium-feature-icon">
                                                🤖
                                            </div>
                                            <h3 className="premium-feature-title">AI-Powered Matching</h3>
                                        </div>
                                        <p className="premium-feature-description">
                                            Advanced AI Matching - Utilize cutting-edge AI algorithms to find the perfect candidates with higher accuracy and speed.
                                        </p>
                                        <div className="premium-feature-benefits">
                                            <span className="premium-benefit-tag">95% Match Accuracy</span>
                                            <span className="premium-benefit-tag">Skills Analysis</span>
                                            <span className="premium-benefit-tag">Cultural Fit</span>
                                        </div>
                                    </div>

                                    {/* Branded Career Page */}
                                    <div className="premium-feature-card">
                                        <div className="premium-feature-header">
                                            <div className="premium-feature-icon">
                                                🏢
                                            </div>
                                            <h3 className="premium-feature-title">Branded Career Page</h3>
                                        </div>
                                        <p className="premium-feature-description">
                                            Custom Career Page - Create a branded careers page that showcases your company culture and attracts top talent.
                                        </p>
                                        <div className="premium-feature-benefits">
                                            <span className="premium-benefit-tag">Custom Domain</span>
                                            <span className="premium-benefit-tag">Company Branding</span>
                                            <span className="premium-benefit-tag">SEO Optimized</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Premium Upgrade CTA */}
                                <div className="premium-upgrade-section">
                                    <div className="upgrade-content">
                                        <h3 className="upgrade-title">Ready to Supercharge Your Hiring?</h3>
                                        <p className="upgrade-description">
                                            Join thousands of companies using our premium features to find top talent faster and more efficiently.
                                        </p>
                                        <div className="upgrade-features">
                                            <div className="upgrade-feature-item">✨ Unlimited Job Posts</div>
                                            <div className="upgrade-feature-item">🚀 Priority Support</div>
                                            <div className="upgrade-feature-item">📊 Advanced Analytics</div>
                                            <div className="upgrade-feature-item">🤖 AI-Powered Matching</div>
                                        </div>
                                        <button
                                            className="upgrade-button"
                                            onClick={() => {
                                                setFeedbackMessage({
                                                    type: 'info',
                                                    message: 'Premium upgrade feature coming soon! Contact support for early access.'
                                                });
                                            }}
                                        >
                                            <FiCloud /> Upgrade to Premium
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Account Section */}
                    {activeTab === 'account' && (
                        <section className="account-section">
                            <div className="account-management">
                                <h2>Account Management</h2>
                                <p className="account-management-subtitle">
                                    Manage your profile, company information, security settings, and account preferences
                                </p>

                                {/* Profile Editing Section */}
                                <div className="profile-edit-section">
                                    <h3>Profile Editing</h3>

                                    {/* Profile Information Display */}
                                    <div className="profile-info-grid">
                                        <div className="profile-info-item">
                                            <div className="profile-info-label">Name</div>
                                            <div className="profile-info-value">{profile.firstName} {profile.middleName} {profile.lastName}</div>
                                        </div>
                                        <div className="profile-info-item">
                                            <div className="profile-info-label">Email</div>
                                            <div className="profile-info-value">{profile.email}</div>
                                        </div>
                                        <div className="profile-info-item">
                                            <div className="profile-info-label">Username</div>
                                            <div className="profile-info-value">{profile.username}</div>
                                        </div>
                                        <div className="profile-info-item">
                                            <div className="profile-info-label">Phone</div>
                                            <div className="profile-info-value">{profile.phone}</div>
                                        </div>
                                        <div className="profile-info-item">
                                            <div className="profile-info-label">Age</div>
                                            <div className="profile-info-value">{profile.age}</div>
                                        </div>
                                        <div className="profile-info-item">
                                            <div className="profile-info-label">Gender</div>
                                            <div className="profile-info-value">{profile.gender}</div>
                                        </div>
                                        <div className="profile-info-item">
                                            <div className="profile-info-label">Location</div>
                                            <div className="profile-info-value">{profile.location}</div>
                                        </div>
                                    </div>

                                    <div className="profile-actions">
                                        <button className="edit-profile-btn" onClick={() => setIsEditingAccount(true)}>
                                            Edit Profile
                                        </button>
                                    </div>

                                    {isEditingAccount && (
                                        <EditableForm
                                            profile={profile}
                                            onSave={handleProfileUpdate}
                                            onCancel={() => setIsEditingAccount(false)}
                                        />
                                    )}
                                </div>

                                {/* Company Information Section */}
                                <div className="company-info-section">
                                    <h3>Company Information</h3>
                                    <div className="company-details-card">
                                        <div className="company-info-grid">
                                            <div className="company-info-item">
                                                <label>Company Name</label>
                                                <p>{company.name || 'smart'}</p>
                                            </div>
                                            <div className="company-info-item">
                                                <label>Company Location</label>
                                                <p>{company.location || 'Ethiopia'}</p>
                                            </div>
                                            <div className="company-info-item">
                                                <label>Employees</label>
                                                <p>{profile.employeesCount || '30'}</p>
                                            </div>
                                            <div className="company-info-item">
                                                <label>Established</label>
                                                <p>{company.yearEstablished || '2020'}</p>
                                            </div>
                                            <div className="company-info-item">
                                                <label>Verification Status</label>
                                                <p className={profile.isVerified ? 'verified' : 'pending'}>
                                                    {profile.isVerified ? 'Verified' : 'Pending Verification'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={toggleCompanyModal}
                                            className="edit-company-btn"
                                        >
                                            Edit Company Details
                                        </button>
                                    </div>
                                </div>

                                {/* Security Settings */}
                                <div className="security-section">
                                    <h3>Security Settings</h3>
                                    <SecurityForm onPasswordUpdate={handlePasswordUpdate} />
                                </div>

                                {/* Quick Stats Section */}
                                <div className="account-stats-section">
                                    <h3>Quick Stats</h3>
                                    <div className="quick-stats-grid">
                                        <div className="quick-stat">
                                            <span className="stat-number">{jobs.length}</span>
                                            <span className="stat-label">Active Jobs</span>
                                        </div>
                                        <div className="quick-stat">
                                            <span className="stat-number">{applicants.length}</span>
                                            <span className="stat-label">Total Applications</span>
                                        </div>
                                        <div className="quick-stat">
                                            <span className="stat-number">{applicants.filter(a => a.status === 'accepted').length}</span>
                                            <span className="stat-label">Successful Hires</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                <div className="danger-zone">
                                    <h3>Danger Zone</h3>
                                    <p>Permanently delete your account and all associated data</p>
                                    <button
                                        className="delete-account-btn"
                                        onClick={() => setShowDeleteConfirm(true)}
                                    >
                                        Delete Account
                                    </button>

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

                    {/* Feedback Section */}
                    {activeTab === 'feedback' && (
                        <section className="feedback-section">
                            <h2>Share Your Feedback</h2>
                            <p className="feedback-section-subtitle">
                                Help us improve by sharing your thoughts, suggestions, or reporting issues.
                            </p>

                            <form
                                className="feedback-form"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setFeedbackMessage({
                                        type: 'success',
                                        message: 'Thank you for your feedback! We appreciate your input.'
                                    });
                                }}
                            >
                                {/* Feedback Categories */}
                                <div className="feedback-categories">
                                    <div className="feedback-category">
                                        <span className="feedback-category-icon">💡</span>
                                        <h5 className="feedback-category-title">Suggestion</h5>
                                    </div>
                                    <div className="feedback-category">
                                        <span className="feedback-category-icon">🐛</span>
                                        <h5 className="feedback-category-title">Bug Report</h5>
                                    </div>
                                    <div className="feedback-category">
                                        <span className="feedback-category-icon">⭐</span>
                                        <h5 className="feedback-category-title">Feature Request</h5>
                                    </div>
                                    <div className="feedback-category">
                                        <span className="feedback-category-icon">📝</span>
                                        <h5 className="feedback-category-title">General Feedback</h5>
                                    </div>
                                </div>

                                {/* Subject Field */}
                                <div className="feedback-form-group">
                                    <label htmlFor="feedback-subject">Subject</label>
                                    <input
                                        type="text"
                                        id="feedback-subject"
                                        className="feedback-input"
                                        placeholder="Brief description of your feedback"
                                        required
                                    />
                                </div>

                                {/* Email Field */}
                                <div className="feedback-form-group">
                                    <label htmlFor="feedback-email" className="optional">Email</label>
                                    <input
                                        type="email"
                                        id="feedback-email"
                                        className="feedback-input"
                                        placeholder="your.email@example.com"
                                        defaultValue="your.email@example.com"
                                    />
                                    <div className="feedback-help-text">
                                        We'll use this to follow up if needed
                                    </div>
                                </div>

                                {/* Message Field */}
                                <div className="feedback-form-group">
                                    <label htmlFor="feedback-message">Message</label>
                                    <textarea
                                        id="feedback-message"
                                        className="feedback-textarea"
                                        placeholder="Please provide detailed feedback..."
                                        rows="6"
                                        required
                                    ></textarea>
                                </div>

                                {/* Submit Button */}
                                <button type="submit" className="feedback-submit-btn">
                                    Send Feedback
                                </button>
                            </form>
                        </section>
                    )}

                    {/* Statistics Section */}
                    {activeTab === 'stats' && (
                        <section className="stats-section">
                            <h2>Account Statistics</h2>
                            <div className="stats-content">
                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-icon">
                                            <FiBriefcase />
                                        </div>
                                        <div className="stat-info">
                                            <span className="stat-number">{jobs.length}</span>
                                            <span className="stat-label">Jobs Posted</span>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">
                                            <FiUsers />
                                        </div>
                                        <div className="stat-info">
                                            <span className="stat-number">{applicants.length}</span>
                                            <span className="stat-label">Applications Received</span>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">
                                            <FiCheckCircle />
                                        </div>
                                        <div className="stat-info">
                                            <span className="stat-number">{applicants.filter(a => a.status === 'accepted').length}</span>
                                            <span className="stat-label">Successful Hires</span>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon">
                                            <FiTrendingUp />
                                        </div>
                                        <div className="stat-info">
                                            <span className="stat-number">85%</span>
                                            <span className="stat-label">Profile Completion</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Footer */}
            <motion.footer
                className="careerplus__footer"
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
                        <a href="/employeraccount" className="careerplus__footer-link">Account</a>
                        <a href="/employerjobposting" className="careerplus__footer-link">Post Job</a>
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

            {/* Company Details Modal */}
            {showCompanyModal && (
                <div className="company-modal">
                    <div className="company-modal-content">
                        <CompanyDetailModal
                            company={company}
                            onClose={toggleCompanyModal}
                        />
                    </div>
                </div>
            )}

            {/* Job Edit Modal */}
            {editingJob && (
                <div className="job-edit-modal" style={{ display: 'block', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }}>
                    <div className="job-edit-modal-content" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', borderRadius: '8px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
                        <div className="job-edit-modal-header">
                            <h3>Edit Job Posting</h3>
                            <button
                                onClick={cancelJobUpdate}
                                className="close-modal-btn"
                            >
                                &times;
                            </button>
                        </div>
                        {console.log('Modal is rendering with editingJob:', editingJob)}
                        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                            <strong>Debug Info:</strong>
                            <br />Editing Job ID: {editingJob}
                            <br />Job Title: {jobFormData.title}
                        </div>
                        <form onSubmit={saveJobUpdate} className="job-edit-form">
                            <div className="form-group">
                                <label htmlFor="title">Job Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={jobFormData.title}
                                    onChange={handleJobFormChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">Location</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={jobFormData.location}
                                    onChange={handleJobFormChange}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="job_type">Job Type</label>
                                    <select
                                        id="job_type"
                                        name="job_type"
                                        value={jobFormData.job_type}
                                        onChange={handleJobFormChange}
                                        required
                                    >
                                        <option value="">Select Job Type</option>
                                        <option value="full-time">Full Time</option>
                                        <option value="part-time">Part Time</option>
                                        <option value="contract">Contract</option>
                                        <option value="freelance">Freelance</option>
                                        <option value="internship">Internship</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="experience_level">Experience Level</label>
                                    <select
                                        id="experience_level"
                                        name="experience_level"
                                        value={jobFormData.experience_level}
                                        onChange={handleJobFormChange}
                                        required
                                    >
                                        <option value="">Select Experience Level</option>
                                        <option value="entry">Entry Level</option>
                                        <option value="mid">Mid Level</option>
                                        <option value="senior">Senior Level</option>
                                        <option value="executive">Executive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="salary_min">Minimum Salary</label>
                                    <input
                                        type="number"
                                        id="salary_min"
                                        name="salary_min"
                                        value={jobFormData.salary_min}
                                        onChange={handleJobFormChange}
                                        placeholder="e.g., 50000"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="salary_max">Maximum Salary</label>
                                    <input
                                        type="number"
                                        id="salary_max"
                                        name="salary_max"
                                        value={jobFormData.salary_max}
                                        onChange={handleJobFormChange}
                                        placeholder="e.g., 70000"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <input
                                    type="text"
                                    id="category"
                                    name="category"
                                    value={jobFormData.category}
                                    onChange={handleJobFormChange}
                                    placeholder="e.g., Technology, Marketing, Sales"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="application_deadline">Application Deadline</label>
                                <input
                                    type="date"
                                    id="application_deadline"
                                    name="application_deadline"
                                    value={jobFormData.application_deadline}
                                    onChange={handleJobFormChange}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Job Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={jobFormData.description}
                                    onChange={handleJobFormChange}
                                    rows="6"
                                    placeholder="Describe the job responsibilities, requirements, and what the candidate can expect..."
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={cancelJobUpdate}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="save-btn"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Applicants Modal */}
            {showApplicantModal && (
                <div className="applicant-modal">
                    <div className="applicant-modal-content">
                        <div className="applicant-modal-header">
                            <h3>Applicants</h3>
                            <button
                                onClick={() => setShowApplicantModal(false)}
                                className="close-modal-btn"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="applicants-list">
                            {currentJobApplicants.map(applicant => (
                                <ApplicantCard
                                    key={applicant.id}
                                    applicant={applicant}
                                    onAccept={() => handleApplicantAction(applicant.id, 'accepted')}
                                    onReject={() => handleApplicantAction(applicant.id, 'rejected')}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployerAccount;
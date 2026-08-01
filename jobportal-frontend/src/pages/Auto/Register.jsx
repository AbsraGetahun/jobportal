import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/pages/JobSeeker/Register.css';
import api from '../../api';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';

const Register = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();
    
    // State for field of study options
    const [fieldOfStudyOptions, setFieldOfStudyOptions] = useState([]);
    const [filteredFieldOfStudyOptions, setFilteredFieldOfStudyOptions] = useState([]);
    
    // Fetch field of study options from the API
    useEffect(() => {
        const fetchFieldOfStudyOptions = async () => {
            try {
                const response = await api.getFieldOfStudyOptions();
                if (response.data && response.data.data) {
                    const options = response.data.data.map(item => item.name);
                    setFieldOfStudyOptions(options);
                    setFilteredFieldOfStudyOptions(options);
                }
            } catch (error) {
                console.error('Error fetching field of study options:', error);
            }
        };
        
        fetchFieldOfStudyOptions();
    }, []);
    
    // Close field of study suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filteredFieldOfStudyOptions.length > 0) {
                const fieldOfStudyInput = document.getElementById('fieldOfStudy');
                const suggestionsContainer = document.querySelector('.field-of-study-suggestions');
                
                if (fieldOfStudyInput && !fieldOfStudyInput.contains(event.target) &&
                    suggestionsContainer && !suggestionsContainer.contains(event.target)) {
                    setFilteredFieldOfStudyOptions([]);
                }
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [filteredFieldOfStudyOptions]);

    // Redirect authenticated users to dashboard
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);
    
    const [scrolled, setScrolled] = useState(false);

   
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
        const handleScroll = () => {
            if (window.scrollY > 50) { // If scrolled more than 50px
                if (Object.keys(errors).length > 0) {
                    setError({
                        general: 'Please fix the following errors:',
                        fields: errors
                    });
                    setLoading(false);
                    return;
                }
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll); // Attach listener
        // Cleanup function: remove listener when component unmounts
        return () => window.removeEventListener('scroll', handleScroll);
    }, []); // Runs once on mount

    /*
     * Function to toggle the theme between 'light' and 'dark'.
     */
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    /*
     * `userType` state: Determines if the user is registering as a 'jobSeeker' or 'employer'.
     */
    const [userType, setUserType] = useState('jobSeeker');

    /*
     * `hasCompany` state: For employers, determines if they are registering with company details.
     */
    const [hasCompany, setHasCompany] = useState(false);

    /*
     * `error` state: Stores and displays any error messages from form submission or API calls.
     */
    const [error, setError] = useState({
        general: '',
        fields: {}
    });

    /*
     * `loading` state: Indicates if the form submission is in progress.
     */
    const [loading, setLoading] = useState(false);

    /*
     * `formData` state: Holds all the input values for the registration form.
     * Includes fields for both job seekers and employers.
     */
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        age: '',
        gender: '',
        location: '',
        countryCode: '+1', // Default country code for phone number
        phone: '',
        email: '',
        username: '',
        password: '',
        password2: '',
        rememberMe: false,

        degree: '',
        experience: '',
        graduationYear: '',
        fieldOfStudy: '',
        
        companyName: '',
        companyLocation: '',
        employeesCount: '',
        establishmentYear: ''
    });

   
    const errorMessages = {
        required: 'This field is required',
        invalid: 'Please enter a valid value',
        mismatch: 'Values do not match',
        unique: 'This value is already in use',
        format: 'Please enter the value in correct format',
        length: 'Value must be at least 8 characters long',
        passwordComplexity: 'Password must include uppercase, lowercase, number, and special character'
    };

    const GENDER_CHOICES = [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' },
        { value: 'prefer-not-to-say', label: 'Prefer not to say' }
    ];

    const DEGREE_CHOICES = [
        { value: 'Bachelor', label: 'Bachelor' },
        { value: 'Master', label: 'Master' },
        { value: 'PhD', label: 'PhD' },
        { value: 'Diploma', label: 'Diploma' }
    ];

    const FIELD_OF_STUDY_CHOICES = [
        { value: 'Computer Science', label: 'Computer Science' },
        { value: 'Engineering', label: 'Engineering' },
        { value: 'Business', label: 'Business' },
        { value: 'Arts', label: 'Arts' },
        { value: 'Medicine', label: 'Medicine' }
    ];

    const COUNTRY_CODES = [
        { code: '+1', country: 'United States' },
        { code: '+44', country: 'United Kingdom' },
        { code: '+91', country: 'India' },
        { code: '+86', country: 'China' },
        { code: '+81', country: 'Japan' },
        { code: '+49', country: 'Germany' },
        { code: '+33', country: 'France' },
        { code: '+61', country: 'Australia' },
        { code: '+55', country: 'Brazil' },
        { code: '+27', country: 'South Africa' },
        { code: '+234', country: 'Nigeria' },
        { code: '+254', country: 'Kenya' },
        { code: '+251', country: 'Ethiopia' },
        { code: '+20', country: 'Egypt' },
        { code: '+212', country: 'Morocco' }
    ];

    let errors = {};

    // Email validation regex
    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };
    
    // Password complexity validation
    const validatePasswordComplexity = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[@$!%*?&]/.test(password);
        
        return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    };
    
    /*
     * `handleChange` function: A generic handler for all text and select inputs.
     * Updates `formData` state based on the input's `name` attribute.
     * Clears field-specific errors when user starts typing.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error for this field when user starts typing
        if (error.fields[name]) {
            setError(prev => ({
                ...prev,
                fields: Object.fromEntries(
                    Object.entries(prev.fields).filter(([key]) => key !== name)
                )
            }));
        }
        
        // Clear general error when user starts typing
        if (error.general) {
            setError(prev => ({ ...prev, general: '' }));
        }
    };

    /*
     * `handleFieldOfStudyChange` function: Handler for the field of study input.
     * Updates formData and filters the field of study options.
     */
    const handleFieldOfStudyChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, fieldOfStudy: value }));
        
        // Filter field of study options based on user input
        if (value.length > 0) {
            const filtered = fieldOfStudyOptions.filter(option =>
                option.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredFieldOfStudyOptions(filtered);
        } else {
            setFilteredFieldOfStudyOptions([]);
        }
        
        // Clear error for this field when user starts typing
        if (error.fields.fieldOfStudy) {
            setError(prev => ({
                ...prev,
                fields: Object.fromEntries(
                    Object.entries(prev.fields).filter(([key]) => key !== 'fieldOfStudy')
                )
            }));
        }
        
        // Clear general error when user starts typing
        if (error.general) {
            setError(prev => ({ ...prev, general: '' }));
        }
    };

    /*
     * `handlePhoneChange` function: Specific handler for the phone number input.
     * Ensures only digits are entered.
     */
    const handlePhoneChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) { // Regular expression to allow only digits
            setFormData(prev => ({ ...prev, phone: value }));
        }
    };

    /*
     * `handleSubmit` function: Handles the form submission.
     * Sends data to the appropriate API endpoint based on `userType`.
     * Includes error handling for network issues and API responses.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError({ general: '', fields: {} });
        setLoading(true);

        // Client-side validation
        errors = {};

        // Required fields
        if (!formData.firstName) errors.firstName = errorMessages.required;
        if (!formData.lastName) errors.lastName = errorMessages.required;
        if (!formData.email) errors.email = errorMessages.required;
        if (!formData.username) errors.username = errorMessages.required;
        if (!formData.password) errors.password = errorMessages.required;
        if (!formData.password2) errors.password2 = errorMessages.required;
        if (formData.password !== formData.password2) errors.password2 = errorMessages.mismatch;
        if (formData.password.length < 8) errors.password = errorMessages.length;
        else if (!validatePasswordComplexity(formData.password)) errors.password = errorMessages.passwordComplexity;
        if (!formData.phone) errors.phone = errorMessages.required;
        if (!formData.gender) errors.gender = errorMessages.required;
        if (!formData.location) errors.location = errorMessages.required;

        // Format validation
        if (formData.phone && !/^[+]?[0-9]+$/.test(formData.phone)) {
            errors.phone = errorMessages.format;
        }

        if (Object.keys(errors).length > 0) {
            setError({
                general: 'Please fix the following errors:',
                fields: errors
            });
            setLoading(false);
            return;
        }

        try {
            // Prepare the common submission data fields, including username and password2
            const submitData = {
                name: `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`,
                email: formData.email,
                username: formData.username,
                password: formData.password,
                password_confirmation: formData.password2,
                phone: formData.countryCode + formData.phone, // Combine country code with phone number
                age: formData.age,
                gender: formData.gender,
                location: formData.location,
                address: formData.location, // Use location as address for now
                website: '' // Optional field
            };

            // Conditionally add fields based on user type
            if (userType === 'jobSeeker') {
                submitData.degree = formData.degree;
                submitData.experience = formData.experience || '0'; // Send experience as string, default to '0'
                submitData.graduationYear = formData.graduationYear; // Send as string to match 'digits:4' validation rule
                submitData.fieldOfStudy = formData.fieldOfStudy;

                // Call the job seeker registration API endpoint
                const response = await api.createJobSeeker(submitData); // Using external 'api'
                if (response.data) {
                    // Save credentials if "Remember Me" is checked
                    if (formData.rememberMe) {
                        localStorage.setItem('rememberedEmail', formData.email);
                    } else {
                        localStorage.removeItem('rememberedEmail');
                    }
                    // Redirect to login page with success message
                    navigate('/login', { state: { success: response.data.message || 'Registration completed successfully. You can now log in to your account.' } });
                }
            } else { // User is an 'employer'
                if (hasCompany) {
                    // If employer has a company, include company details
                    submitData.hasCompany = true;
                    submitData.companyName = formData.companyName;
                    submitData.companyLocation = formData.companyLocation;
                    submitData.employeesCount = parseInt(formData.employeesCount) || null;
                    submitData.establishmentYear = formData.establishmentYear || null; // Send as string to match 'digits:4' validation rule
                } else {
                    // If no company, explicitly set hasCompany to false
                    submitData.hasCompany = false;
                }

                // Call the employer registration API endpoint
                const response = await api.createEmployer(submitData); // Using external 'api'
                if (response.data) {
                    // Save credentials if "Remember Me" is checked
                    if (formData.rememberMe) {
                        localStorage.setItem('rememberedEmail', formData.email);
                    } else {
                        localStorage.removeItem('rememberedEmail');
                    }
                    // Redirect to login page with success message
                    navigate('/login', { state: { success: response.data.message || 'Registration completed successfully. You can now log in to your account.' } });
                }
            }
        } catch (err) {
            console.error('Full error object:', err); // Log the complete error for debugging

            // Handle network errors (e.g., server unreachable)
            if (err.message === "Network Error") {
                setError({
                    general: 'Cannot connect to server. Please check your internet connection or server status.',
                    fields: {}
                });
                return;
            }

            // Handle API response errors (e.g., HTTP 4xx, 5xx status codes)
            if (err.response) {
                // Handle API validation errors
                console.log('API Error Response:', err.response.data); // Log the complete error response for debugging
                const apiErrors = err.response.data || {};

                // Format errors for display
                const formattedErrors = {
                    general: '',
                    fields: {}
                };

                // Handle general errors
                if (apiErrors.detail) {
                    formattedErrors.general = apiErrors.detail;
                }

                // Handle field-specific errors
                Object.entries(apiErrors).forEach(([field, message]) => {
                    if (field === 'non_field_errors') {
                        formattedErrors.general = message.join(', ');
                    } else if (Array.isArray(message)) {
                        formattedErrors.fields[field] = message.join(', ');
                    } else if (typeof message === 'string') {
                        formattedErrors.fields[field] = message;
                    }
                });

                console.log('Formatted Errors:', formattedErrors); // Log formatted errors for debugging
                setError(formattedErrors);
            } else {
                setError({
                    general: 'An unexpected error occurred. Please try again later.',
                    fields: {}
                });
            }
        } finally {
            setLoading(false); // Hide loading indicator regardless of success or failure
        }
    };

    return (
        <div className={`careerplus-register-root ${theme}`}>
            {/* Header Section */}
            <motion.header
                className={`careerplus__header ${scrolled ? 'scrolled' : ''}`}
                // Dynamically adjust header background color based on theme and scroll position
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
                    <nav className="careerplus__nav">
                        <Link to="/" className="careerplus__nav-link">Home</Link> {/* Using Link for navigation */}
                        <button
                            className="careerplus__theme-toggle"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                        >
                            {theme === 'light' ? <FiMoon /> : <FiSun />} {/* Using react-icons */}
                        </button>
                    </nav>
                </div>
            </motion.header>

            {/* Main Registration Section */}
            <main className="careerplus-register-main">
                <motion.section
                    className="careerplus-register-card glass-card"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="careerplus-register-title">Create Account</h1>
                    <p className="careerplus-register-subtitle">Join us as a...</p>

                    {/* Display error messages */}
                    {error.general && (
                        <div className="careerplus-register-error">
                            <h3>Registration Error</h3>
                            <p>{error.general}</p>
                        </div>
                    )}
                    {Object.keys(error.fields).length > 0 && (
                        <div className="careerplus-register-error">
                            <h3>Field Errors</h3>
                            <ul>
                                {Object.entries(error.fields).map(([field, message]) => (
                                    <li key={field}>{message}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* User Type Selection: Job Seeker or Employer */}
                    <div className="user-type-group">
                        <div className="user-type-options">
                            <label className={`user-type-option ${userType === 'jobSeeker' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="userType"
                                    value="jobSeeker"
                                    checked={userType === 'jobSeeker'}
                                    onChange={() => setUserType('jobSeeker')}
                                />
                                Job Seeker
                            </label>
                            <label className={`user-type-option ${userType === 'employer' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="userType"
                                    value="employer"
                                    checked={userType === 'employer'}
                                    onChange={() => setUserType('employer')}
                                />
                                Employer
                            </label>
                        </div>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="careerplus-register-form">
                        {/* First Name and Middle Name Row */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="firstName" className="careerplus-register-label">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className={`careerplus-register-input ${error.fields.firstName ? 'invalid' : ''}`}
                                    placeholder="First name"
                                    autoComplete="given-name"
                                />
                                {error.fields.firstName && <div className="careerplus-register-error">{error.fields.firstName}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="middleName" className="careerplus-register-label">Middle Name</label>
                                <input
                                    type="text"
                                    id="middleName"
                                    name="middleName"
                                    value={formData.middleName}
                                    onChange={handleChange}
                                    className={`careerplus-register-input ${error.fields.middleName ? 'invalid' : ''}`}
                                    placeholder="Middle name (optional)"
                                    autoComplete="additional-name"
                                />
                                {error.fields.middleName && <div className="careerplus-register-error">{error.fields.middleName}</div>}
                            </div>
                        </div>

                        {/* Last Name */}
                        <div className="form-group">
                            <label htmlFor="lastName" className="careerplus-register-label">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className={`careerplus-register-input ${error.fields.lastName ? 'invalid' : ''}`}
                                placeholder="Last name"
                                autoComplete="family-name"
                            />
                            {error.fields.lastName && <div className="careerplus-register-error">{error.fields.lastName}</div>}
                        </div>

                        {/* Age and Gender Row */}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="age" className="careerplus-register-label">Age</label>
                                <input
                                    type="number"
                                    id="age"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    required
                                    min="18"
                                    className={`careerplus-register-input ${error.fields.age ? 'invalid' : ''}`}
                                    placeholder="Your age"
                                    autoComplete="age"
                                />
                                {error.fields.age && <div className="careerplus-register-error">{error.fields.age}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="gender" className="careerplus-register-label">Gender</label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                    className={`careerplus-register-input ${error.fields.gender ? 'invalid' : ''}`}
                                >
                                    <option value="">Select gender</option>
                                    {GENDER_CHOICES.map(choice => (
                                        <option key={choice.value} value={choice.value}>
                                            {choice.label}
                                        </option>
                                    ))}
                                </select>
                                {error.fields.gender && <div className="careerplus-register-error">{error.fields.gender}</div>}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="form-group">
                            <label htmlFor="location" className="careerplus-register-label">Location</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                className={`careerplus-register-input ${error.fields.location ? 'invalid' : ''}`}
                                placeholder="City, Country"
                                autoComplete="address-level2"
                            />
                            {error.fields.location && <div className="careerplus-register-error">{error.fields.location}</div>}
                        </div>

                        {/* Phone Number with Country Code */}
                        <div className="form-group">
                            <label htmlFor="phone" className="careerplus-register-label">Phone Number</label>
                            <div className="phone-input-group">
                                <select
                                    id="countryCode"
                                    name="countryCode"
                                    value={formData.countryCode}
                                    onChange={handleChange}
                                    className="careerplus-register-input country-code-select"
                                >
                                    {COUNTRY_CODES.map(({ code, country }) => (
                                        <option key={code} value={code}>
                                            {code} ({country})
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handlePhoneChange}
                                    required
                                    className={`careerplus-register-input phone-input ${error.fields.phone ? 'invalid' : ''}`}
                                    placeholder="Phone number"
                                    pattern="[0-9]*" // HTML5 pattern for numeric input
                                    inputMode="numeric" // Soft keyboard hint for mobile
                                />
                                {error.fields.phone && <div className="careerplus-register-error">{error.fields.phone}</div>}
                            </div>
                        </div>

                        {/* Email Address */}
                        <div className="form-group">
                            <label htmlFor="email" className="careerplus-register-label">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className={`careerplus-register-input ${error.fields.email ? 'invalid' : ''}`}
                                placeholder="Enter your email"
                                autoComplete="email"
                            />
                            {error.fields.email && <div className="careerplus-register-error">{error.fields.email}</div>}
                        </div>

                        {/* Username Input Field */}
                        <div className="form-group">
                            <label htmlFor="username" className="careerplus-register-label">Username</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                className="careerplus-register-input"
                                placeholder="Choose a username"
                                autoComplete="username"
                            />
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label htmlFor="password" className="careerplus-register-label">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="8"
                                className="careerplus-register-input"
                                placeholder="Create a password"
                                autoComplete="new-password"
                            />
                            <p className="password-hint">Minimum 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)</p>
                        </div>

                        {/* Password2 (Confirm Password) Input Field */}
                        <div className="form-group">
                            <label htmlFor="password2" className="careerplus-register-label">Confirm Password</label>
                            <input
                                type="password"
                                id="password2"
                                name="password2"
                                value={formData.password2}
                                onChange={handleChange}
                                required
                                minLength="8"
                                className="careerplus-register-input"
                                placeholder="Confirm your password"
                                autoComplete="new-password"
                            />
                        </div>

                        {/* Job Seeker Specific Fields (conditionally rendered) */}
                        {userType === 'jobSeeker' && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="degree" className="careerplus-register-label">Highest Degree</label>
                                    <select
                                        id="degree"
                                        name="degree"
                                        value={formData.degree}
                                        onChange={handleChange}
                                        required
                                        className="careerplus-register-input"
                                    >
                                        <option value="">Select degree</option>
                                        {DEGREE_CHOICES.map(choice => (
                                            <option key={choice.value} value={choice.value}>
                                                {choice.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="experience" className="careerplus-register-label">Experience (years)</label>
                                        <input
                                            type="number"
                                            id="experience"
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleChange}
                                            min="0"
                                            className="careerplus-register-input"
                                            placeholder="Years of experience"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="graduationYear" className="careerplus-register-label">Graduation Year</label>
                                        <input
                                            type="number"
                                            id="graduationYear"
                                            name="graduationYear"
                                            value={formData.graduationYear}
                                            onChange={handleChange}
                                            min="1900"
                                            max={new Date().getFullYear()}
                                            className="careerplus-register-input"
                                            placeholder="Year of graduation"
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ position: 'relative' }}>
                                    <label htmlFor="fieldOfStudy" className="careerplus-register-label">Field of Study</label>
                                    <input
                                        type="text"
                                        id="fieldOfStudy"
                                        name="fieldOfStudy"
                                        value={formData.fieldOfStudy}
                                        onChange={handleFieldOfStudyChange}
                                        required
                                        className="careerplus-register-input"
                                        placeholder="Enter your field of study"
                                        autoComplete="off"
                                    />
                                    {filteredFieldOfStudyOptions.length > 0 && formData.fieldOfStudy && (
                                        <ul className="field-of-study-suggestions">
                                            {filteredFieldOfStudyOptions.map((option, index) => (
                                                <li
                                                    key={index}
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, fieldOfStudy: option }));
                                                        setFilteredFieldOfStudyOptions(fieldOfStudyOptions);
                                                    }}
                                                    className="field-of-study-suggestion"
                                                >
                                                    {option}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Employer Specific Fields (conditionally rendered) */}
                        {userType === 'employer' && (
                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={hasCompany}
                                        onChange={() => setHasCompany(!hasCompany)}
                                    />
                                    <span>Do you own a company?</span>
                                </label>
                            </div>
                        )}

                        {userType === 'employer' && hasCompany && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="companyName" className="careerplus-register-label">Company Name</label>
                                    <input
                                        type="text"
                                        id="companyName"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                        className="careerplus-register-input"
                                        placeholder="Your company name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="companyLocation" className="careerplus-register-label">Company Location</label>
                                    <input
                                        type="text"
                                        id="companyLocation"
                                        name="companyLocation"
                                        value={formData.companyLocation}
                                        onChange={handleChange}
                                        required
                                        className="careerplus-register-input"
                                        placeholder="Company headquarters"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="employeesCount" className="careerplus-register-label">Number of Employees</label>
                                        <input
                                            type="number"
                                            id="employeesCount"
                                            name="employeesCount"
                                            value={formData.employeesCount}
                                            onChange={handleChange}
                                            min="1"
                                            className="careerplus-register-input"
                                            placeholder="Approximate count"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="establishmentYear" className="careerplus-register-label">Year Established</label>
                                        <input
                                            type="number"
                                            id="establishmentYear"
                                            name="establishmentYear"
                                            value={formData.establishmentYear}
                                            onChange={handleChange}
                                            min="1900"
                                            max={new Date().getFullYear()}
                                            className="careerplus-register-input"
                                            placeholder="Year founded"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Remember Me Option */}
                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                />
                                <span>Remember my credentials for future logins</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="careerplus-register-btn"
                            disabled={loading} // Disable button when loading
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Registration Footer with Login Link */}
                    <div className="careerplus-register-footer">
                        <p>Already have an account? <Link to="/login" className="careerplus-register-link">Login</Link></p>
                    </div>
                </motion.section>
            </main>

            {/* Footer Section */}
            <footer id="contact" className="careerplus__footer">
                <div className="careerplus__footer-container">
                    <div className="careerplus__footer-brand">
                        <h3 className="careerplus__logo">CareerPlus</h3>
                        <p className="careerplus__footer-text">
                            AI-powered job matching for the modern professional.
                        </p>
                    </div>
                    <div className="careerplus__footer-links">
                        <h4 className="careerplus__footer-heading">Quick Links</h4>
                        <Link to="/" className="careerplus__footer-link">Home</Link>
                        <Link to="/login" className="careerplus__footer-link">Login</Link>
                        <Link to="/register" className="careerplus__footer-link">Register</Link>
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
            </footer>
        </div>
    );
};

export default Register;

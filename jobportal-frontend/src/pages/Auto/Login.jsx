//import React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import '../../styles/pages/JobSeeker/Login.css';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';


const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    
    // State for success message
    const [successMessage, setSuccessMessage] = useState('');

    // Theme logic
    const [scrolled, setScrolled] = useState(false);
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return savedTheme;
    });

    // Login state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState({});
    const [userType, setUserType] = useState('jobseeker');
    const [error, setError] = useState('');
    const [showAdminOption, setShowAdminOption] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    
    // Redirect authenticated users to dashboard
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);
    
    // Check for success message from registration
    useEffect(() => {
        if (location.state && location.state.success) {
            setSuccessMessage(location.state.success);
            // Clear the state so the message doesn't persist on refresh
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);
    
    // Pre-fill email if it was saved
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
        }
    }, []);
    
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

    // Secret door for admin access
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.ctrlKey && event.shiftKey && event.key === 'A') {
                event.preventDefault();
                setShowAdminOption(prev => !prev);
                if (!showAdminOption) {
                    setUserType('admin');
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showAdminOption]);
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    // Auth context is already declared above
    

    
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
    
    // Validate form fields
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!validatePasswordComplexity(formData.password)) {
            newErrors.password = 'Password must include uppercase, lowercase, number, and special character (@$!%*?&)';
        }
        
        return newErrors;
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        
        // Clear general error when user starts typing
        if (error) {
            setError('');
        }
    };
    
    const handleUserTypeChange = (e) => {
        setUserType(e.target.value);
    };


const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  // Validate form before submission
  const formErrors = validateForm();
  if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
  }

  setLoading(true);
  try {
    let response;
    if (userType === 'jobseeker') {
      response = await api.loginJobSeeker({...formData, userType: 'jobseeker'});
    } else if (userType === 'employer') {
      response = await api.loginEmployer({...formData, userType: 'employer'});
    } else if (userType === 'admin') {
      response = await api.loginAdmin({...formData, userType: 'admin'});
    }
    
    // Debug the login response
    console.log('Login response:', response);
    console.log('Access token:', response.data.access_token);
    
    // Store token in localStorage for debugging
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      console.log('Token stored in localStorage');
    }

    // Get user data after login
    console.log('Calling verifyAuth with token:', localStorage.getItem('access_token'));
    const userResponse = await api.verifyAuth();
    console.log('User response:', userResponse);
    const userData = userResponse.data.data; // Extract user data from response
    
    // Use AuthContext login function with correct data structure
    login({
      id: userData.id,
      email: userData.email,
      username: userData.username,
      name: userData.name,
      hasCompany: userData.hasCompany,
      is_admin: userData.is_admin
    }, response.data.access_token);
    
    // Save or remove email based on "Remember Me" option
    if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
    } else {
        localStorage.removeItem('rememberedEmail');
    }

    // Navigate after successful login
    if (userType === 'jobseeker') {
      navigate('/jobseekeraccount');
    } else if (userType === 'employer') {
      navigate('/employeraccount');
    } else if (userType === 'admin') {
      navigate('/admin/dashboard');
    }
  } catch (err) {
   if (err.response && err.response.data) {
       setError(
           err.response.data.non_field_errors?.[0] ||
           err.response.data.detail ||
           err.response.data.message ||
           'Login failed. Please check your credentials.'
       );
   } else {
       setError('Login failed. Please check your credentials.');
   }
} finally {
   setLoading(false);
 }

};


    return (
        <div className={`careerplus-login-root ${theme}`}>
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
                    <nav className="careerplus__nav">
                        <a href="/" className="careerplus__nav-link">Home</a>
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

            {/* Main Login Section */}
            <main className="careerplus-login-main">
                <motion.section
                    className="careerplus-login-card glass-card"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="careerplus-login-title">Sign In</h1>
                    <p className="careerplus-login-subtitle">Access your account to find your next opportunity</p>
                    {successMessage && <div className="careerplus-login-success">{successMessage}</div>}
                    <form onSubmit={handleSubmit} className="careerplus-login-form">
                        <div className="form-group user-type-group">
                            <label className="careerplus-login-label">User Type</label>
                            <div className="user-type-options">
                                <label className={`user-type-option ${userType === 'jobseeker' ? 'selected' : ''}`} htmlFor="jobseeker">
                                    <input
                                        type="radio"
                                        id="jobseeker"
                                        name="userType"
                                        value="jobseeker"
                                        checked={userType === 'jobseeker'}
                                        onChange={handleUserTypeChange}
                                    />
                                    Job Seeker
                                </label>
                                <label className={`user-type-option ${userType === 'employer' ? 'selected' : ''}`} htmlFor="employer">
                                    <input
                                        type="radio"
                                        id="employer"
                                        name="userType"
                                        value="employer"
                                        checked={userType === 'employer'}
                                        onChange={handleUserTypeChange}
                                    />
                                    Employer
                                </label>
                                {showAdminOption && (
                                    <label className={`user-type-option ${userType === 'admin' ? 'selected' : ''}`} htmlFor="admin">
                                        <input
                                            type="radio"
                                            id="admin"
                                            name="userType"
                                            value="admin"
                                            checked={userType === 'admin'}
                                            onChange={handleUserTypeChange}
                                        />
                                        Admin
                                    </label>
                                )}
                            </div>
                            {!showAdminOption && (
                                <div className="admin-hint" style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem', textAlign: 'center' }}>
                                    Press <kbd style={{ background: '#f0f0f0', padding: '2px 4px', borderRadius: '3px' }}>Ctrl+Shift+A</kbd> for admin access
                                </div>
                            )}
                            {showAdminOption && (
                                <div className="admin-hint" style={{ fontSize: '0.8rem', color: '#28a745', marginTop: '0.5rem', textAlign: 'center' }}>
                                    🔓 Admin access enabled! Press <kbd style={{ background: '#f0f0f0', padding: '2px 4px', borderRadius: '3px' }}>Ctrl+Shift+A</kbd> again to hide
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label htmlFor="email" className="careerplus-login-label">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter your email"
                                className={`careerplus-login-input ${errors.email ? 'invalid' : ''}`}
                                autoComplete="email"
                            />
                            {errors.email && <div className="careerplus-login-error">{errors.email}</div>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="password" className="careerplus-login-label">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter your password"
                                className={`careerplus-login-input ${errors.password ? 'invalid' : ''}`}
                                autoComplete="current-password"
                            />
                            {errors.password && <div className="careerplus-login-error">{errors.password}</div>}
                        </div>
                        
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
                                <span>Remember me</span>
                            </label>
                        </div>
                        
                        {error && <div className="careerplus-login-error">{error}</div>}
                        <button type="submit" className="careerplus-login-btn" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>

                    </form>
                    <div className="careerplus-login-footer">
                        <p>Don't have an account? <Link to="/register" className="careerplus-login-link">Register</Link></p>
                    </div>
                </motion.section>
            </main>

            {/* Footer */}
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
                        <a href="/" className="careerplus__footer-link">Home</a>
                        <a href="/login" className="careerplus__footer-link">Login</a>
                        <a href="/register" className="careerplus__footer-link">Register</a>
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

export default Login;
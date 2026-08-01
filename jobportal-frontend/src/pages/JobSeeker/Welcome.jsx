import React from 'react';
import '../../styles/pages/JobSeeker/Welcome.css';
import imageOne from '../../assets/image-1.jpg';
import imageTwo from '../../assets/man1.jpg';
import imageThree from '../../assets/man1.jpg';

import { useState, useEffect } from 'react';
import { motion, useScroll, useAnimation, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiCheckCircle, FiBell, FiBarChart2, FiStar, FiSun, FiMoon, FiMapPin, FiDollarSign, FiClock, FiTag } from 'react-icons/fi';
import { FaLinkedin, FaTwitter, FaGithub } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import JobNotification from '../../components/JobNotification/JobNotification';

const Welcome = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [theme, setTheme] = useState(() => {
        // Check if theme is stored in localStorage
        const savedTheme = localStorage.getItem('theme');
        // Check system preference if no saved theme
        if (!savedTheme) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return savedTheme;
    });
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const controls = useAnimation();
    const { scrollY } = useScroll();

    // Redirect authenticated users to dashboard
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    // Handle body scroll lock when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [mobileMenuOpen]);

    // Update theme when it changes
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
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

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async (search = '') => {
        try {
            console.log('Fetching jobs from API...');
            const url = search
                ? `http://localhost:8000/api/jobs?search=${encodeURIComponent(search)}`
                : 'http://localhost:8000/api/jobs';
            const response = await fetch(url);
            console.log('API response status:', response.status);
            const data = await response.json();
            console.log('API response data:', data);
            // Get only the first 8 jobs for the welcome page
            setJobs(data.data.data.slice(0, 8));
        } catch (error) {
            console.error('Error fetching jobs:', error);
        }
    };

    const handleViewAllJobs = () => {
        navigate('/jobsearch');
    };

    const handleApply = (jobId) => {
        // For now, just redirect to job search page
        navigate('/jobsearch');
    };

    useEffect(() => {
        scrollY.on("change", (latest) => {
            if (latest > 300) {
                controls.start("visible");
            }
        });
    }, [scrollY, controls]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    const handleExplore = () => {
        navigate('/jobsearch');
    };

    const handleJoinNow = () => {
        navigate('/register');
    };

    const testimonials = [
        {
            id: 1,
            name: "Jemal Hussen",
            role: "UX Designer",
            company: "TechInnovate",
            content: "CareerPlus helped me find my dream job in just 2 weeks! The AI recommendations were spot on.",
            avatar: imageTwo,
            rating: 5
        },
        {
            id: 2,
            name: "Telehaymanot Wale",
            role: "Software Engineer",
            company: "Digital Solutions Ltd",
            content: "I was getting frustrated with traditional job boards. CareerPlus understands what I'm looking for.",
            avatar: imageThree,
            rating: 5
        },
        {
            id: 3,
            name: "Yosef Kasse",
            role: "Marketing Manager",
            company: "Global Marketing Corp",
            content: "The real-time alerts saved me so much time.",
            avatar: imageTwo,
            rating: 5
        },
        {
            id: 4,
            name: "Amina Hassan",
            role: "Data Analyst",
            company: "Analytics Pro",
            content: "The platform's insights into my market value were eye-opening. I negotiated a 20% higher salary!",
            avatar: imageThree,
            rating: 5
        },
        {
            id: 5,
            name: "Berhanu Tekle",
            role: "Project Manager",
            company: "BuildIt Construction",
            content: "As someone changing careers, CareerPlus helped me identify transferable skills and find relevant opportunities.",
            avatar: imageTwo,
            rating: 5
        },
        {
            id: 6,
            name: "Sophia Abraham",
            role: "HR Specialist",
            company: "PeopleFirst Inc",
            content: "The application tracking system made my job search so much easier. I could see exactly where I was in the process.",
            avatar: imageThree,
            rating: 5
        }
    ];

    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    return (
        <div className={`careerplus ${theme === 'dark' ? 'dark' : ''}`}>
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
                        <a href="#home" className="careerplus__nav-link">Home</a>
                        <a href="#features" className="careerplus__nav-link">Features</a>
                        <a href="#testimonials" className="careerplus__nav-link">Testimonials</a>
                        <a href="#contact" className="careerplus__nav-link">Contact</a>
                        <a href="/login" className="careerplus__nav-link">Login</a>
                        <a href="/register" className="careerplus__nav-link careerplus__nav-link--register">Register</a>
                        <button 
                            className="careerplus__theme-toggle"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                        >
                            {theme === 'light' ? <FiMoon /> : <FiSun />}
                        </button>
                    </nav>
                    {/* Mobile Menu Button */}
                    <button
                        className="careerplus__mobile-menu-toggle"
                        onClick={toggleMobileMenu}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? '✕' : '☰'}
                    </button>
                </div>
                
                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="careerplus__mobile-menu">
                        <a href="#home" className="careerplus__mobile-link" onClick={closeMobileMenu}>Home</a>
                        <a href="#features" className="careerplus__mobile-link" onClick={closeMobileMenu}>Features</a>
                        <a href="#testimonials" className="careerplus__mobile-link" onClick={closeMobileMenu}>Testimonials</a>
                        <a href="#contact" className="careerplus__mobile-link" onClick={closeMobileMenu}>Contact</a>
                        <a href="/login" className="careerplus__mobile-link" onClick={closeMobileMenu}>Login</a>
                        <a href="/register" className="careerplus__mobile-link careerplus__mobile-link--register" onClick={closeMobileMenu}>Register</a>
                    </div>
                )}
            </motion.header>

            {/* Hero Section */}
            <section id="home" className="careerplus__hero"
                style={theme === 'dark' ? { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' } : {}}>
                <div className="careerplus__hero-content">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="careerplus__hero-title"
                    >
                        Revolutionize Your Job Search with AI.
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="careerplus__hero-text"
                    >
                        Find your perfect job match, smarter and faster.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="careerplus__hero-buttons"
                        
                    >
                        <button 
                        className="careerplus__hero-btn careerplus__hero-btn--primary"
                        title="GetStarted" 
                        onClick={handleViewAllJobs}>
                            Get Started <FiArrowRight />
                        </button>
                        <button className="careerplus__hero-btn careerplus__hero-btn--secondary" onClick={handleExplore}>
                            Explore
                        </button>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="careerplus__hero-image"
                >
                    <img src={imageOne} alt="AI job search illustration" />
                </motion.div>
            </section>

            {/* Job Search Section */}
            <section className="careerplus__job-search">
                <div className="careerplus__job-search-container">
                    <h3 className="careerplus__section-title">Latest Job Opportunities</h3>
                    
                    <div className="careerplus__job-search-form">
                        <div className="careerplus__search-inputs">
                            <input
                                type="text"
                                placeholder="Search jobs..."
                                className="careerplus__search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button
                                className="careerplus__search-btn"
                                onClick={() => fetchJobs(searchTerm)}
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    <div className="careerplus__latest-jobs">
                        {jobs && jobs.length > 0 ? (
                            jobs.map((job) => (
                                <div key={job.id} className="careerplus__job-card">
                                    <h4>{job.title}</h4>
                                    <p className="careerplus__job-company">{job.employer?.companyName || job.employer?.name || 'Company not specified'}</p>
                                    <div className="careerplus__job-details">
                                        <p><FiMapPin /> {job.location || 'Location not specified'}</p>
                                        <p><FiDollarSign /> {job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max}` : 'Salary not specified'}</p>
                                        <p><FiClock /> {job.application_deadline ? `Deadline: ${new Date(job.application_deadline).toLocaleDateString()}` : 'No deadline specified'}</p>
                                        <p><FiTag /> {job.category || 'Category not specified'}</p>
                                    </div>
                                    <button
                                        className="careerplus__job-apply"
                                        onClick={() => handleApply(job.id)}
                                    >
                                        Apply
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>No jobs found. Try adjusting your search criteria.</p>
                        )}
                    </div>
                    
                    <div className="careerplus__more-jobs">
                        <button className="careerplus__more-jobs-btn" onClick={handleViewAllJobs}>
                            More Jobs
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="careerplus__features">
                <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="careerplus__section-title"
                >
                    Why Choose CareerPlus?
                </motion.h3>

                <div className="careerplus__features-grid">
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                        }}
                        initial="hidden"
                        animate={controls}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="careerplus__feature-card"
                    >
                        <div className="careerplus__feature-icon">
                            <FiCheckCircle />
                        </div>
                        <h4 className="careerplus__feature-title">Personalized Recommendations</h4>
                        <p className="careerplus__feature-text">
                            Our AI learns your preferences to suggest jobs that truly match your skills and aspirations.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                        }}
                        initial="hidden"
                        animate={controls}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="careerplus__feature-card"
                    >
                        <div className="careerplus__feature-icon">
                            <FiBell />
                        </div>
                        <h4 className="careerplus__feature-title">Real-Time Job Alerts</h4>
                        <p className="careerplus__feature-text">
                            Get instant notifications when new jobs matching your profile are posted.
                        </p>
                    </motion.div>

                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                        }}
                        initial="hidden"
                        animate={controls}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="careerplus__feature-card"
                    >
                        <div className="careerplus__feature-icon">
                            <FiBarChart2 />
                        </div>
                        <h4 className="careerplus__feature-title">Data-Driven Insights</h4>
                        <p className="careerplus__feature-text">
                            Understand your market value and how you compare to other candidates.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="careerplus__how-it-works">
                <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="careerplus__section-title"
                >
                    How CareerPlus Works
                </motion.h3>
                
                <div className="careerplus__steps-container">
                    <div className="careerplus__step">
                        <div className="careerplus__step-number">1</div>
                        <h4 className="careerplus__step-title">Create Your Profile</h4>
                        <p className="careerplus__step-description">Sign up and build your comprehensive profile with your skills, experience, and career preferences.</p>
                    </div>
                    <div className="careerplus__step">
                        <div className="careerplus__step-number">2</div>
                        <h4 className="careerplus__step-title">Get AI Recommendations</h4>
                        <p className="careerplus__step-description">Our AI analyzes your profile and matches you with relevant job opportunities.</p>
                    </div>
                    <div className="careerplus__step">
                        <div className="careerplus__step-number">3</div>
                        <h4 className="careerplus__step-title">Apply with Confidence</h4>
                        <p className="careerplus__step-description">Apply to jobs directly through our platform with tailored application materials.</p>
                    </div>
                    <div className="careerplus__step">
                        <div className="careerplus__step-number">4</div>
                        <h4 className="careerplus__step-title">Track Your Progress</h4>
                        <p className="careerplus__step-description">Monitor your applications and receive real-time updates on your job search progress.</p>
                    </div>
                </div>
            </section>

            {/* Statistics Section */}
            <section className="careerplus__stats">
                <div className="careerplus__stats-container">
                    <div className="careerplus__stat-item">
                        <h3 className="careerplus__stat-number">10,000+</h3>
                        <p className="careerplus__stat-label">Jobs Available</p>
                    </div>
                    <div className="careerplus__stat-item">
                        <h3 className="careerplus__stat-number">95%</h3>
                        <p className="careerplus__stat-label">Match Accuracy</p>
                    </div>
                    <div className="careerplus__stat-item">
                        <h3 className="careerplus__stat-number">500+</h3>
                        <p className="careerplus__stat-label">Partner Companies</p>
                    </div>
                    <div className="careerplus__stat-item">
                        <h3 className="careerplus__stat-number">2 Weeks</h3>
                        <p className="careerplus__stat-label">Average Time to Hire</p>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="careerplus__testimonials">
                <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="careerplus__section-title"
                >
                    What Our Users Say
                </motion.h3>

                <div className="careerplus__testimonial-container">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={testimonials[currentTestimonial].id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5 }}
                            className="careerplus__testimonial-card"
                        >
                            <div className="careerplus__testimonial-avatar">
                                <img
                                    src={testimonials[currentTestimonial].avatar}
                                    alt={testimonials[currentTestimonial].name}
                                />
                            </div>
                            <div className="careerplus__testimonial-rating">
                                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                                    <FiStar key={i} className="careerplus__testimonial-star" />
                                ))}
                            </div>
                            <p className="careerplus__testimonial-content">
                                "{testimonials[currentTestimonial].content}"
                            </p>
                            <div className="careerplus__testimonial-author">
                                <h4>{testimonials[currentTestimonial].name}</h4>
                                <p>{testimonials[currentTestimonial].role}, {testimonials[currentTestimonial].company}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="careerplus__testimonial-dots">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                className={`careerplus__testimonial-dot ${index === currentTestimonial ? 'active' : ''}`}
                                onClick={() => setCurrentTestimonial(index)}
                            />
                        ))}
                    </div>
                </div>
            </section>


            {/* CTA Section */}
            <section className="careerplus__cta">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="careerplus__cta-content"
                >
                    <h3 className="careerplus__cta-title">Ready to take the next step in your career?</h3>
                    <button className="careerplus__cta-btn" onClick={handleJoinNow}>
                        Join Now <FiArrowRight />
                    </button>
                </motion.div>
            </section>

            {/* FAQ Section */}
            <section className="careerplus__faq">
                <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="careerplus__section-title"
                >
                    Frequently Asked Questions
                </motion.h3>
                
                <div className="careerplus__faq-container">
                    <div className="careerplus__faq-item">
                        <h4 className="careerplus__faq-question">How does the AI matching work?</h4>
                        <p className="careerplus__faq-answer">Our AI analyzes your profile, skills, and preferences to match you with jobs that align with your career goals. We use machine learning algorithms to continuously improve our recommendations based on your interactions and feedback.</p>
                    </div>
                    <div className="careerplus__faq-item">
                        <h4 className="careerplus__faq-question">Is my data secure?</h4>
                        <p className="careerplus__faq-answer">Absolutely. We use bank-level encryption to protect your personal information. All data is stored securely and we never share your information with third parties without your explicit consent.</p>
                    </div>
                    <div className="careerplus__faq-item">
                        <h4 className="careerplus__faq-question">How much does it cost to use CareerPlus?</h4>
                        <p className="careerplus__faq-answer">CareerPlus is completely free for job seekers. We only charge employers a small fee when they successfully hire a candidate through our platform.</p>
                    </div>
                    <div className="careerplus__faq-item">
                        <h4 className="careerplus__faq-question">How can I improve my chances of getting hired?</h4>
                        <p className="careerplus__faq-answer">Complete your profile fully, including all relevant skills and experience. Respond promptly to job alerts and tailor your application materials for each position. Our platform also provides tips and insights to help you optimize your profile.</p>
                    </div>
                </div>
            </section>

            {/* Premium Features Section */}
            <section className="careerplus__premium">
                <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="careerplus__section-title"
                >
                    Premium Features
                </motion.h3>
                
                <div className="careerplus__premium-container">
                    <div className="careerplus__premium-card">
                        <div className="careerplus__premium-icon">⭐</div>
                        <h4 className="careerplus__premium-title">Priority Applications</h4>
                        <p className="careerplus__premium-description">Get your applications seen first by employers with our priority placement feature.</p>
                    </div>
                    <div className="careerplus__premium-card">
                        <div className="careerplus__premium-icon">📊</div>
                        <h4 className="careerplus__premium-title">Advanced Analytics</h4>
                        <p className="careerplus__premium-description">Access detailed insights into your job search performance and market trends.</p>
                    </div>
                    <div className="careerplus__premium-card">
                        <div className="careerplus__premium-icon">💼</div>
                        <h4 className="careerplus__premium-title">Exclusive Jobs</h4>
                        <p className="careerplus__premium-description">Apply to premium job listings that aren't available to regular users.</p>
                    </div>
                    <div className="careerplus__premium-card">
                        <div className="careerplus__premium-icon">👨‍💼</div>
                        <h4 className="careerplus__premium-title">Career Coaching</h4>
                        <p className="careerplus__premium-description">Get personalized career advice from industry experts.</p>
                    </div>
                </div>
                
                <div className="careerplus__premium-cta">
                    <button className="careerplus__premium-btn" onClick={() => navigate('/register')}>
                        Upgrade to Premium
                    </button>
                </div>
            </section>

            {/* Trust Badges Section */}
            <section className="careerplus__trust">
                <div className="careerplus__trust-container">
                    <div className="careerplus__trust-item">
                        <span className="careerplus__trust-icon">🏆</span>
                        <span className="careerplus__trust-text">Award Winner 2025</span>
                    </div>
                    <div className="careerplus__trust-item">
                        <span className="careerplus__trust-icon">👥</span>
                        <span className="careerplus__trust-text">100,000+ Users</span>
                    </div>
                    <div className="careerplus__trust-item">
                        <span className="careerplus__trust-icon">⭐</span>
                        <span className="careerplus__trust-text">4.9/5 Rating</span>
                    </div>
                    <div className="careerplus__trust-item">
                        <span className="careerplus__trust-icon">🛡️</span>
                        <span className="careerplus__trust-text">Trusted by Fortune 500</span>
                    </div>
                </div>
            </section>

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
                        <a href="#home" className="careerplus__footer-link">Home</a>
                        <a href="#features" className="careerplus__footer-link">Features</a>
                        <a href="#testimonials" className="careerplus__footer-link">Testimonials</a>
                        <a href="#contact" className="careerplus__footer-link">Contact</a>
                    </div>

                    <div className="careerplus__footer-contact">
                        <h4 className="careerplus__footer-heading">Contact Us</h4>
                        <p className="careerplus__footer-text">hello@careerplus.com</p>
                        <p className="careerplus__footer-text">+251 (9) 123-456</p>
                    </div>

                    <div className="careerplus__footer-security">
                        <h4 className="careerplus__footer-heading">Security</h4>
                        <div className="careerplus__security-badges">
                            <span className="careerplus__security-badge">🔒 SSL Encrypted</span>
                            <span className="careerplus__security-badge">🛡️ GDPR Compliant</span>
                            <span className="careerplus__security-badge">✅ Verified</span>
                        </div>
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

export default Welcome;
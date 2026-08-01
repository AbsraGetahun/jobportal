import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiX, FiUpload, FiPhone, FiUser, FiMail, FiMapPin, FiGlobe, FiCalendar, FiBriefcase } from 'react-icons/fi';
import Tooltip from '../Tooltip';
import '../../styles/components/JobSeeker/EditableForm.css';

const EditableForm = ({ profile, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        profilePic: profile.profilePic,
        firstName: profile.firstName || '',
        middleName: profile.middleName || '',
        lastName: profile.lastName || '',
        username: profile.username || '',
        graduationYear: profile.graduationYear || '',
        phone: profile.phone || '',
        degree: profile.degree || '',
        fieldOfStudy: profile.fieldOfStudy || '',
        experience: profile.experience || '',
        age: profile.age || '',
        gender: profile.gender || '',
        location: profile.location || '',
        address: profile.address || '',
        website: profile.website || '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [profileImage, setProfileImage] = useState(profile.profilePic);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (profile) {
            setFormData({
                profilePic: profile.profilePic,
                firstName: profile.firstName || '',
                middleName: profile.middleName || '',
                lastName: profile.lastName || '',
                username: profile.username || '',
                graduationYear: profile.graduationYear || '',
                phone: profile.phone || '',
                degree: profile.degree || '',
                fieldOfStudy: profile.fieldOfStudy || '',
                experience: profile.experience || '',
                age: profile.age || '',
                gender: profile.gender || '',
                location: profile.location || '',
                address: profile.address || '',
                website: profile.website || '',
                newPassword: '',
                confirmPassword: ''
            });
            setProfileImage(profile.profilePic);
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, profilePic: 'Image size must be less than 2MB' }));
                return;
            }

            // Validate file type
            if (!file.type.match('image.*')) {
                setErrors(prev => ({ ...prev, profilePic: 'Please select a valid image file' }));
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                setProfileImage(event.target.result);
                setFormData(prev => ({ ...prev, profilePic: event.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required fields validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        // Phone validation (optional but must be valid format if provided)
        if (formData.phone && formData.phone.trim()) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,20}$/;
            if (!phoneRegex.test(formData.phone.trim())) {
                newErrors.phone = 'Please enter a valid phone number';
            }
        }

        // Email validation (if provided)
        if (formData.email && formData.email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                newErrors.email = 'Please enter a valid email address';
            }
        }

        // Website validation (if provided)
        if (formData.website && formData.website.trim()) {
            try {
                new URL(formData.website);
            } catch {
                newErrors.website = 'Please enter a valid website URL';
            }
        }

        // Graduation year validation
        if (formData.graduationYear) {
            const year = parseInt(formData.graduationYear);
            const currentYear = new Date().getFullYear();
            if (isNaN(year) || year < 1900 || year > currentYear + 10) {
                newErrors.graduationYear = 'Please enter a valid graduation year';
            }
        }

        // Age validation
        if (formData.age) {
            const age = parseInt(formData.age);
            if (isNaN(age) || age < 1 || age > 120) {
                newErrors.age = 'Please enter a valid age (1-120)';
            }
        }

        // Experience validation
        if (formData.experience) {
            const exp = parseInt(formData.experience);
            if (isNaN(exp) || exp < 0 || exp > 50) {
                newErrors.experience = 'Please enter valid years of experience (0-50)';
            }
        }

        // Password validation
        if (formData.newPassword && formData.newPassword.length < 8) {
            newErrors.newPassword = 'Password must be at least 8 characters';
        }
        if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        // Ensure preventDefault is called immediately
        e.preventDefault();
        e.stopPropagation();

        console.log('🔄 FORM SUBMIT STARTED');

        if (!validateForm()) {
            console.log('❌ FORM VALIDATION FAILED');
            return false;
        }

        setIsSubmitting(true);
        console.log('🔄 FORM SUBMISSION STARTED - isSubmitting set to true');

        try {
            // Remove password fields from submission if they're empty
            const submitData = { ...formData };
            if (!submitData.newPassword) {
                delete submitData.newPassword;
                delete submitData.confirmPassword;
            }

            console.log('📤 SUBMITTING PROFILE DATA:', submitData);
            console.log('🔗 CALLING onSave function...');

            const result = await onSave(submitData);
            console.log('✅ onSave completed successfully:', result);

            return false; // Explicitly return false to prevent any form submission

        } catch (error) {
            console.error('❌ ERROR SUBMITTING FORM:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                stack: error.stack
            });

            // Set specific error messages based on error type
            if (error.response) {
                if (error.response.status === 422) {
                    setErrors({ submit: 'Validation failed. Please check your inputs.' });
                } else if (error.response.status === 401) {
                    setErrors({ submit: 'Authentication failed. Please log in again.' });
                } else if (error.response.status === 500) {
                    setErrors({ submit: 'Server error. Please try again later.' });
                } else {
                    setErrors({ submit: `Server error (${error.response.status}). Please try again.` });
                }
            } else if (error.request) {
                setErrors({ submit: 'Network error. Please check your connection and try again.' });
            } else {
                setErrors({ submit: 'An unexpected error occurred. Please try again.' });
            }

            return false; // Explicitly return false to prevent any form submission
        } finally {
            setIsSubmitting(false);
            console.log('🔄 FORM SUBMISSION FINISHED - isSubmitting set to false');
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🚫 FORM SUBMIT EVENT PREVENTED AT FORM LEVEL');
        return false;
    };

    return (
        <motion.form
            onSubmit={handleFormSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="editable-form"
            noValidate
        >
            {/* Profile Picture Section */}
            <div className="form-section">
                <h3 className="section-title">Profile Picture</h3>
                <div className="form-group profile-pic-group">
                    <div className="image-upload-container">
                        <img
                            src={profileImage}
                            alt="Profile"
                            className="profile-pic-preview"
                        />
                        <label className="upload-btn">
                            <FiUpload /> Change Photo
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </div>
                    {errors.profilePic && <div className="error-message">{errors.profilePic}</div>}
                </div>
            </div>

            {/* Personal Information Section */}
            <div className="form-section">
                <h3 className="section-title">
                    <FiUser /> Personal Information
                </h3>

                <div className="form-row">
                    <div className="form-group">
                        <label>First Name *</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={errors.firstName ? 'error' : ''}
                            placeholder="Enter your first name"
                        />
                        {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                    </div>
                    <div className="form-group">
                        <label>Middle Name</label>
                        <input
                            type="text"
                            name="middleName"
                            value={formData.middleName}
                            onChange={handleChange}
                            placeholder="Enter your middle name"
                        />
                    </div>
                    <div className="form-group">
                        <label>Last Name *</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={errors.lastName ? 'error' : ''}
                            placeholder="Enter your last name"
                        />
                        {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                    </div>
                </div>

                <div className="form-group">
                    <label>Username *</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={errors.username ? 'error' : ''}
                        placeholder="Choose a unique username"
                    />
                    {errors.username && <div className="error-message">{errors.username}</div>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Age</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            className={errors.age ? 'error' : ''}
                            placeholder="e.g., 25"
                            min="1"
                            max="120"
                        />
                        {errors.age && <div className="error-message">{errors.age}</div>}
                    </div>
                    <div className="form-group">
                        <label>Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Contact Information Section */}
            <div className="form-section">
                <h3 className="section-title">
                    <FiPhone /> Contact Information
                </h3>

                <div className="form-group">
                    <label>
                        Phone Number
                        <Tooltip text="Enter your phone number with country code for better reachability" />
                    </label>
                    <div className="input-with-icon">
                        <FiPhone className="input-icon" />
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={errors.phone ? 'error' : ''}
                            placeholder="e.g., +251977586823 or 0912345678"
                        />
                    </div>
                    {errors.phone && <div className="error-message">{errors.phone}</div>}
                    <div className="field-hint">Leave empty if you prefer not to share</div>
                </div>

                <div className="form-group">
                    <label>
                        Location
                        <Tooltip text="Your current city and country" />
                    </label>
                    <div className="input-with-icon">
                        <FiMapPin className="input-icon" />
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g., Addis Ababa, Ethiopia"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="e.g., 123 Main St, City, Country"
                    />
                </div>

                <div className="form-group">
                    <label>
                        Website
                        <Tooltip text="Your personal or professional website" />
                    </label>
                    <div className="input-with-icon">
                        <FiGlobe className="input-icon" />
                        <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className={errors.website ? 'error' : ''}
                            placeholder="https://www.example.com"
                        />
                    </div>
                    {errors.website && <div className="error-message">{errors.website}</div>}
                </div>
            </div>

            {/* Education Section */}
            <div className="form-section">
                <h3 className="section-title">
                    <FiBriefcase /> Education & Experience
                </h3>

                <div className="form-row">
                    <div className="form-group">
                        <label>Degree</label>
                        <input
                            type="text"
                            name="degree"
                            value={formData.degree}
                            onChange={handleChange}
                            placeholder="e.g., Bachelor of Science"
                        />
                    </div>
                    <div className="form-group">
                        <label>Field of Study</label>
                        <input
                            type="text"
                            name="fieldOfStudy"
                            value={formData.fieldOfStudy}
                            onChange={handleChange}
                            placeholder="e.g., Computer Science"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>
                            Graduation Year
                            <Tooltip text="The year you completed or expect to complete your degree" />
                        </label>
                        <input
                            type="number"
                            name="graduationYear"
                            value={formData.graduationYear}
                            onChange={handleChange}
                            className={errors.graduationYear ? 'error' : ''}
                            placeholder="e.g., 2024"
                            min="1900"
                            max={new Date().getFullYear() + 10}
                        />
                        {errors.graduationYear && <div className="error-message">{errors.graduationYear}</div>}
                    </div>
                    <div className="form-group">
                        <label>
                            Years of Experience
                            <Tooltip text="Total professional work experience in years" />
                        </label>
                        <input
                            type="number"
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            className={errors.experience ? 'error' : ''}
                            placeholder="e.g., 5"
                            min="0"
                            max="50"
                        />
                        {errors.experience && <div className="error-message">{errors.experience}</div>}
                    </div>
                </div>
            </div>

            {/* Password Section */}
            <div className="form-section">
                <h3 className="section-title">Change Password (Optional)</h3>
                <div className="password-note">
                    Leave blank if you don't want to change your password
                </div>

                <div className="form-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className={errors.newPassword ? 'error' : ''}
                        placeholder="Enter new password"
                        minLength="8"
                    />
                    {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
                </div>

                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={errors.confirmPassword ? 'error' : ''}
                        placeholder="Confirm new password"
                    />
                    {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
                <div className="submit-error">
                    {errors.submit}
                </div>
            )}

            {/* Form Actions */}
            <div className="form-actions">
                <motion.button
                    type="button"
                    onClick={onCancel}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="cancel-btn"
                    disabled={isSubmitting}
                >
                    <FiX /> Cancel
                </motion.button>
                <motion.button
                    type="button"
                    onClick={handleSubmit}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="save-btn"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <>
                            <div className="spinner"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <FiSave /> Save Changes
                        </>
                    )}
                </motion.button>
            </div>
        </motion.form>
    );
};

export default EditableForm;
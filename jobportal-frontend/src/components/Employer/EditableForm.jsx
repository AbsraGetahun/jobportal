import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiX, FiUpload } from 'react-icons/fi';
import Tooltip from '../Tooltip';

const EditableForm = ({ profile, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        profilePicture: profile.profilePicture,
        firstName: profile.firstName || '',
        middleName: profile.middleName || '',
        lastName: profile.lastName || '',
        username: profile.username || '',
        phone: profile.phone || '',
        age: profile.age || '',
        gender: profile.gender || '',
        location: profile.location || '',
        email: profile.email || '',
        companyName: profile.companyName || '',
        companyLocation: profile.companyLocation || '',
        employeesCount: profile.employeesCount || '',
        establishmentYear: profile.establishmentYear || '',
        newPassword: '',
        confirmPassword: ''
    });

    const [profileImage, setProfileImage] = useState(profile.profilePicture);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfileImage(event.target.result);
                setFormData(prev => ({ ...prev, profilePicture: event.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log('📝 ========== FORM SUBMISSION STARTED ==========');
        console.log('📅 Timestamp:', new Date().toISOString());

        // Check password validation
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            console.error('❌ PASSWORD VALIDATION FAILED: Passwords do not match');
            alert("Passwords don't match!");
            return;
        }

        console.log('🔍 FORM VALIDATION PASSED');

        // Detailed form data analysis
        console.log('📋 COMPLETE FORM DATA BEING SENT:');
        console.log(JSON.stringify(formData, null, 2));

        console.log('📞 PHONE FIELD ANALYSIS:');
        console.log('  Value:', formData.phone);
        console.log('  Type:', typeof formData.phone);
        console.log('  Length:', formData.phone ? formData.phone.length : 0);
        console.log('  Is empty?', formData.phone === '');
        console.log('  Is null?', formData.phone === null);
        console.log('  Is undefined?', formData.phone === undefined);

        // Check other important fields
        console.log('🔍 OTHER IMPORTANT FIELDS:');
        console.log('  First Name:', formData.firstName);
        console.log('  Last Name:', formData.lastName);
        console.log('  Email:', formData.email);
        console.log('  Location:', formData.location);

        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'email'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        if (missingFields.length > 0) {
            console.error('❌ MISSING REQUIRED FIELDS:', missingFields);
            alert(`Please fill in required fields: ${missingFields.join(', ')}`);
            return;
        }

        console.log('✅ ALL VALIDATIONS PASSED - SENDING DATA TO PARENT');

        try {
            onSave(formData);
            console.log('📤 DATA SUCCESSFULLY SENT TO PARENT COMPONENT');
        } catch (error) {
            console.error('❌ ERROR SENDING DATA TO PARENT:', error);
        }
    };

    return (
        <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="editable-form"
        >
            <div className="form-group">
                <label>Profile Picture</label>
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
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Middle Name</label>
                    <input
                        type="text"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label>Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
            
            <div className="form-group">
                <label>Username</label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
            </div>
            
            <div className="form-group">
                <label>Phone Number</label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g., +251 911 123 456"
                />
            </div>
            
            <div className="form-group">
                <label>Age</label>
                <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g., 35"
                />
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
            
            <div className="form-group">
                <label>Location</label>
                <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Addis Ababa, Ethiopia"
                />
            </div>
            
            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>
            
            <h3>Company Information</h3>
            
            <div className="form-group">
                <label>Company Name</label>
                <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g., Tech Solutions Inc."
                />
            </div>
            
            <div className="form-group">
                <label>Company Location</label>
                <input
                    type="text"
                    name="companyLocation"
                    value={formData.companyLocation}
                    onChange={handleChange}
                    placeholder="e.g., Addis Ababa, Ethiopia"
                />
            </div>
            
            <div className="form-group">
                <label>
                    Number of Employees
                    <Tooltip text="Total number of employees in your company. This helps job seekers understand the company size and culture." />
                </label>
                <input
                    type="number"
                    name="employeesCount"
                    value={formData.employeesCount}
                    onChange={handleChange}
                    placeholder="e.g., 50"
                />
            </div>

            <div className="form-group">
                <label>
                    Establishment Year
                    <Tooltip text="The year your company was founded. This gives job seekers insight into your company's history and stability." />
                </label>
                <input
                    type="number"
                    name="establishmentYear"
                    value={formData.establishmentYear}
                    onChange={handleChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    placeholder="e.g., 2010"
                />
            </div>

            <div className="form-group">
                <label>New Password (leave blank to keep current)</label>
                <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                />
            </div>

            <div className="form-group">
                <label>Confirm New Password</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                />
            </div>

            <div className="form-actions">
                <motion.button
                    type="button"
                    onClick={onCancel}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="cancel-btn"
                >
                    <FiX /> Cancel
                </motion.button>
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="save-btn"
                >
                    <FiSave /> Save Changes
                </motion.button>
            </div>
        </motion.form>
    );
};

export default EditableForm;
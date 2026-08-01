import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiEye, FiEyeOff } from 'react-icons/fi';

const SecurityForm = ({ onPasswordUpdate }) => {
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    // Password complexity validation
    const validatePasswordComplexity = (password) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[@$!%*?&]/.test(password);
        
        return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.oldPassword) {
            setError('Current password is required');
            return;
        }

        if (formData.newPassword && formData.newPassword.length < 8) {
            setError('New password must be at least 8 characters');
            return;
        } else if (formData.newPassword && !validatePasswordComplexity(formData.newPassword)) {
            setError('New password must include uppercase, lowercase, number, and special character (@$!%*?&)');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        // Call the parent's password update function
        onPasswordUpdate(formData);
        
        // Reset form
        setFormData({
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    return (
        <>
        <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="security-form"
        >
            <div className="form-group">
                <label>Current Password</label>
                <div className="password-input">
                    <input
                        type={showOldPassword ? "text" : "password"}
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        required
                    />
                    <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                        {showOldPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                </div>
            </div>
 
            <div className="form-group">
                <label>New Password</label>
                <div className="password-input">
                    <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        minLength="8"
                    />
                    <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                        {showNewPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                </div>
            </div>
 
            <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-input">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                    <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                </div>
            </div>
 
            {error && <div className="form-error">{error}</div>}
             
            <p className="password-requirements">
                Password must be at least 8 characters and include uppercase, lowercase, number, and special character (@$!%*?&).
            </p>
 
            <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="save-btn"
            >
                <FiSave /> Update Password
            </motion.button>
        </motion.form>
        <div className="danger-zone">
                <h3>Danger Zone</h3>
                <p>Permanently delete your account and all associated data</p>
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="delete-account-btn"
                    onClick={() => {
                        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                            // In a real implementation, you would call an API endpoint to delete the account
                            console.log("Account deleted");
                            alert("Account deleted successfully!");
                        }
                    }}
                >
                    Delete Account
                </motion.button>
            </div>
        </>
    );
};

export default SecurityForm;
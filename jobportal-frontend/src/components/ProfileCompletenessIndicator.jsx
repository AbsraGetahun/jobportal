import { motion } from 'framer-motion';
import { FiCheck, FiAlertCircle, FiPhone } from 'react-icons/fi';

const ProfileCompletenessIndicator = ({ profile, userType }) => {
    // Calculate profile completeness based on available fields
    const calculateCompleteness = (profile, userType) => {
        if (!profile) return { percentage: 0, missingFields: [] };

        let fields = [];
        let fieldNames = [];

        if (userType === 'employer') {
            // Employer-specific fields
            fields = [
                { value: profile.firstName, name: 'First Name' },
                { value: profile.lastName, name: 'Last Name' },
                { value: profile.email, name: 'Email' },
                { value: profile.phone, name: 'Phone Number' },
                { value: profile.companyName, name: 'Company Name' },
                { value: profile.companyLocation, name: 'Company Location' },
                { value: profile.employeesCount, name: 'Number of Employees' },
                { value: profile.establishmentYear, name: 'Year Established' },
                { value: profile.profilePicture, name: 'Profile Picture' }
            ];
        } else {
            // Job seeker-specific fields (default)
            fields = [
                { value: profile.firstName, name: 'First Name' },
                { value: profile.lastName, name: 'Last Name' },
                { value: profile.email, name: 'Email' },
                { value: profile.phone, name: 'Phone Number' },
                { value: profile.degree, name: 'Degree' },
                { value: profile.fieldOfStudy, name: 'Field of Study' },
                { value: profile.experience, name: 'Years of Experience' },
                { value: profile.profilePicture, name: 'Profile Picture' }
            ];
        }

        const filledFields = fields.filter(field => field.value && field.value !== '');
        const missingFields = fields.filter(field => !field.value || field.value === '').map(field => field.name);

        return {
            percentage: Math.round((filledFields.length / fields.length) * 100),
            missingFields: missingFields
        };
    };
    
    const { percentage, missingFields } = calculateCompleteness(profile, userType);

    // Determine progress bar color based on completeness
    const getProgressColor = (percentage) => {
        if (percentage < 30) return '#ef4444'; // red
        if (percentage < 70) return '#f59e0b'; // amber
        return '#10b981'; // green
    };

    return (
        <motion.div
            className="profile-completeness"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="completeness-header">
                <h3>Profile Completeness</h3>
                <span className="completeness-percentage">{percentage}%</span>
            </div>

            <div className="progress-container">
                <div
                    className="progress-bar"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: getProgressColor(percentage)
                    }}
                />
            </div>

            <div className="completeness-message">
                {percentage < 30 && (
                    <p className="low-completeness">
                        <FiAlertCircle className="alert-icon" /> Complete your profile to increase your chances
                    </p>
                )}
                {percentage >= 30 && percentage < 70 && (
                    <p className="medium-completeness">
                        <FiCheck className="check-icon" /> Good start! Add more details to make your profile stand out
                    </p>
                )}
                {percentage >= 70 && (
                    <p className="high-completeness">
                        <FiCheck className="check-icon" /> Excellent! Your profile is nearly complete
                    </p>
                )}
            </div>

            {/* Show missing fields if profile is incomplete */}
            {missingFields.length > 0 && (
                <motion.div
                    className="missing-fields-section"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                >
                    <h4>Missing Information:</h4>
                    <ul className="missing-fields-list">
                        {missingFields.map((field, index) => (
                            <li key={index} className="missing-field-item">
                                {field === 'Phone Number' && <FiPhone className="field-icon" />}
                                <span>{field}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="missing-fields-note">
                        Click "Edit Profile" to add these details and improve your profile completeness.
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ProfileCompletenessIndicator;
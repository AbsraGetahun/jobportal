import { motion } from 'framer-motion';
import { FiCheck, FiAlertCircle, FiPhone, FiUser, FiMail, FiBook, FiBriefcase, FiMapPin, FiCamera } from 'react-icons/fi';

const ProfileCompletenessIndicator = ({ profile }) => {
    // Calculate profile completeness based on available fields
    const calculateCompleteness = (profile) => {
        if (!profile) return { percentage: 0, missingFields: [] };

        const fields = [
            { value: profile.firstName, name: 'First Name', icon: FiUser },
            { value: profile.lastName, name: 'Last Name', icon: FiUser },
            { value: profile.email, name: 'Email', icon: FiMail },
            { value: profile.phone, name: 'Phone Number', icon: FiPhone },
            { value: profile.degree, name: 'Degree', icon: FiBook },
            { value: profile.fieldOfStudy, name: 'Field of Study', icon: FiBriefcase },
            { value: profile.experience, name: 'Years of Experience', icon: FiMapPin },
            { value: profile.profilePic, name: 'Profile Picture', icon: FiCamera }
        ];

        const filledFields = fields.filter(field => field.value && field.value !== '');
        const missingFields = fields.filter(field => !field.value || field.value === '');

        return {
            percentage: Math.round((filledFields.length / fields.length) * 100),
            missingFields: missingFields
        };
    };
    
    const { percentage, missingFields } = calculateCompleteness(profile);

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
                        <FiAlertCircle className="alert-icon" /> Complete your profile to increase your chances of getting hired
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
                        {missingFields.map((field, index) => {
                            const IconComponent = field.icon;
                            return (
                                <li key={index} className="missing-field-item">
                                    <IconComponent className="field-icon" />
                                    <span>{field.name}</span>
                                </li>
                            );
                        })}
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